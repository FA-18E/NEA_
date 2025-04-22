// create plan page
import { BASE_URL } from '@/App'
import { Flex, Box, Fieldset, Field, Input, Button, NativeSelect, Select, Portal, createListCollection, Checkbox, Spinner, Text } from '@chakra-ui/react'
import React, {useState, useEffect} from 'react'
import { toaster } from "@/components/ui/toaster"
import { IoIosAdd } from "react-icons/io";
import "./mapview.css"
import MapWithDraw from './leafletdraw';
import RestrictedAirspaceWindow from './restrictedAirspaceWindow';

const getAircrafts =  async(e) =>{
    try {
        //get all names of aircraft stored in database for select field
        const res = await fetch(BASE_URL + "/fetchAircrafts", {
            method:"GET",
            headers:{
                "Content-Type": "application/json"
            }
        })
        const data = await res.json()
        if (!res.ok){ // show error in console if res not ok
            throw new Error(data.error);
        }
        if (data.length === 0){
            // if no aircraft is stored show error message and return an empty list
            toaster.create({title:"ERROR", type:"error", description:"No aircrafts found", duration:"4000"})
            return []
        }
        return data // otherwise return aircraft names
    } catch (error) {
        // show error popup message
        toaster.create({title: "Error", type: "error", description: error.message ,duration:"4000"})
    }
}

const getUnit = (quantity) =>{
    // return unit of each quantity
    switch (quantity){
        case "distance": return "km" // km if its a distance
        case "fuel": return "kg" // kg if fuel
        case "time": return "hours" // hours if time
        case "altitude": return "m" // metres if altitude
        default: return "" // empty string otherwise
    }
}

const CreatePlan = () => {
    const [a, setAircrafts] = useState([]); 
    useEffect(() => {
        const fetchAircrafts = async () => {
            const data = await getAircrafts();
            setAircrafts(data);  // Store aircraft data in state
        };
        fetchAircrafts();
    }, []);  // Runs only once when component mounts
    const aircrafts = createListCollection({
        items:a.map((aircraft) =>({ label: aircraft, value: aircraft}))
    })
    
    // set api post values
    const [planValues, setPlanValues] = useState({
        source: "",
        target: "", 
        aircraft: [],
        altitude: 1000,
    })

    const [returnedValues, setReturnedValues] = useState([]) // stores the values returned from server

    const [checkBoxValue, setCheckBoxValue] = useState(true) // stores the value of the check box (add plan to map)
    const [groupName, setGroupName] = useState("")
    const [restrictedAirspace, setRestrictedAirspace] = useState([])  // restricted airspace vertex list

    const [isLoading, setIsLoading] = useState(false)
    const handleSubmit = async(e) =>{
        e.preventDefault()
        setIsLoading(true) // set loading as true to render spinner
        try {
            // payload of request: 
            // plan values: source&target airport, altitude & aircraft model
            //add to map: boolean -> true = add plan to map 
            // group name: name of plan group if add to map
            const payload = {
                ...planValues, 
                addToMap: checkBoxValue,
                groupName: groupName,
                restrictedAirspace: restrictedAirspace,
            }
            // send and fetch data
            const res = await fetch(BASE_URL + "/createPlan", {
                method:"POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify(payload)}) // stringify payload
            const data = await res.json() // response form server if ok
            if (!res.ok){ // throw error if not ok
                throw new Error(data.error);
            }
            setReturnedValues(data)  // set returnedvalues as data for the UI to display
            setPlanValues({source: "", target: "", aircraft: [], altitude: 1000})  // reset values back to initial
            setCheckBoxValue(true) // reset check box as true
            setGroupName("") // reset groupname as empty
            setRestrictedAirspace([])
            console.log(data)

            if( data === "airport in restricted airspace"){
                // return warning and not path if airport is located in the restricted airspace
                toaster.create({title:"Warning", type:"warning", description:"Airport in restricted airspace", duration:"6000"})
            }else{
                // notify user that path generation is successful
                toaster.create({title:"Success", type:"success", description:"Flight plan generated successfully", duration:"4000"})
            }
            setIsLoading(false)  // remove spinner from rendering
        } catch (error) {
            // render error message
            toaster.create({title: "Error", type: "error", description: error.message ,duration:"4000"})
            setIsLoading(false)
            setReturnedValues(("ERROR - " + error.message))
            // reset values
            setReturnedValues([])
            setRestrictedAirspace([])
        }
    }

    const handleRestrictedVerticesImport = (e) =>{
        // set file import to a list variable
        setRestrictedAirspace(e)
    }

	return (
		<>
		<Flex direction="column" align="center" justify="center">
            {/* output text box */}
            <Box borderWidth="1px" borderRadius="lg" minH="400px" minW={{ base: "50%", sm: "70%" }} maxW={{ sm: "100%", lg: "35%" }} p={4} color="green.500">
                {isLoading === true? 
                <Flex direction="column" align="center">
                    <Spinner size="lg" color="green.500" />
                    <Text mt={2} fontWeight="medium">
                        Calculating...
                    </Text>
                </Flex>: 
                
                (returnedValues !== "airport in restricted airspace"? Object.entries(returnedValues).map(([key, value], index) => (
                    <Box key={index} p={2}>
                        <Text fontWeight="bold">
                            {key} ({getUnit(key)})
                        </Text>
                        <Text color="green.600">
                            {JSON.stringify(value)}
                        </Text>
                    </Box>)): <Text fontSize={"xl"}> WARNING: airport in restricted airspace</Text>
                )}
            </Box>
            {/* input fields */}
            <Box p={4} width={{sm: "90%", lg: "70%"}}>
                <form onSubmit={handleSubmit}>
                    <Fieldset.Root>
                        <Flex justify="center" align="center" gap={4} my={4} wrap="wrap">
                            <Field.Root required width="30%">
                                <Field.Label>Enter departure airport<Field.RequiredIndicator /></Field.Label>
                                <Input placeholder="Departure Airport" value={planValues.source} 
                                onChange={(v) => setPlanValues({...planValues, source: v.target.value})}/>
                            </Field.Root>
                            <Field.Root required width="30%">
                            <Field.Label>Enter arrival airport<Field.RequiredIndicator /></Field.Label>
                                <Input placeholder="Arrival Airport"  value={planValues.target} 
                                onChange={(v) => setPlanValues({...planValues, target: v.target.value})}/>
                            </Field.Root>
                            <Field.Root required width="30%">
                            <Field.Label>Enter flight level in m<Field.RequiredIndicator /></Field.Label>
                                <Input placeholder="flight altitude"  value={planValues.altitude} 
                                onChange={(v) => setPlanValues({...planValues, altitude: v.target.value})}/>
                            </Field.Root>

                            <Select.Root collection={aircrafts} size="sm" width="320px" value={planValues.aircraft} 
                            onValueChange={(e) => setPlanValues({...planValues, aircraft: e.value})}
                            required maxW={"30%"}>
                                <Select.HiddenSelect />
                                <Select.Label>Select Aircraft</Select.Label>
                                <Select.Control>
                                <Select.Trigger>
                                    <Select.ValueText placeholder="Select ..." />
                                </Select.Trigger>
                                <Select.IndicatorGroup>
                                    <Select.Indicator />
                                </Select.IndicatorGroup>
                                </Select.Control>
                                <Portal>
                                <Select.Positioner>
                                    <Select.Content>
                                    {aircrafts.items.map((aircraft) => (
                                        //console.log(aircraft)
                                        <Select.Item item={aircraft} key={aircraft.value}>
                                        {aircraft.value}
                                        <Select.ItemIndicator />
                                        </Select.Item>
                                    ))}
                                    </Select.Content>
                                </Select.Positioner>
                                </Portal>
                            </Select.Root>

                        </Flex>
                        <Flex  direction="column" align="center" p={4} pb={6}>
                            <Flex direction="row" align="center" gap={4}>
                                {/* add plan to show on map check box */}
                                <Checkbox.Root checked={checkBoxValue} onCheckedChange={() => setCheckBoxValue(prev => !prev)}>
                                    {/* {console.log(checkBoxValue)} */}
                                    <Checkbox.HiddenInput/>
                                    <Checkbox.Control/>
                                    <Checkbox.Label>Add plan to map</Checkbox.Label>
                                </Checkbox.Root>
                                {/* restricted airspace input window */}
                                <RestrictedAirspaceWindow airspaceVertexList={handleRestrictedVerticesImport}/>
                                
                            </Flex>
                            {/* only render when a restricted airspace list is entered */}
                            
                            {restrictedAirspace.length > 0 && 
                                <Box height={"10%"} maxW={"50%"} p={4} color={"gray.700"}>
                                    <Text fontSize={"md"}>Restricted Airspace vertices: </Text>
                                    <Text fontSize={"sm"}>[{restrictedAirspace[0].join(", ")}], [{restrictedAirspace[1].join(", ")}] ....</Text>
                                </Box>}
                            <Field.Root disabled={!checkBoxValue} required>
                                <Field.Label>Map group name<Field.RequiredIndicator /></Field.Label>
                                <Input placeholder="Enter the group name..." value={groupName} onChange={(e) => setGroupName(e.target.value)}/>
                            </Field.Root>

                        </Flex>
                        
                    </Fieldset.Root>
                    <Flex direction="row" align="center">
                        <Button type={"submit"}>Calculate</Button>
                    </Flex>
                </form>
            </Box>
		</Flex>
		</>
	)
}

export default CreatePlan
