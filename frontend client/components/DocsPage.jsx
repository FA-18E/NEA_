// documents page
import { Box, Collapsible, Table, Tabs, Text, Flex, Image, Button } from '@chakra-ui/react'
import React from 'react'
import {useColorMode, useColorModeValue} from "@/components/ui/color-mode" // light and dark mode settings
import { Link } from 'react-router-dom'

const getTableFieldsData = (table) =>{
    switch(table){
        // field name: [data type, unit]
        case "Aircraft": return[
            ["AircraftID", "string", "N/A", "* Primary Key * // Aircraft model"], 
            ["MaxFuelLoad", "int/float", "kg", "Maximum fuel storage/payload"], 
            ["CruiseSpeed", "int/float", "knots", "Cruise speed of aircraft"], 
            ["MaxAltitude", "int/float", "metres(m)", "Maximum cruising altitude"], 
            ["EngineID", "string", "N/A", "Engine model that the aircraft uses"], 
            ["NumberOfEngines", "int/float", "N/A", "Number of engines on the aircraft"], 
            ["Manufacturer", "string", "N/A", "Manufacturer of aircrfat"], 
            ["EmptyWeight", "int/float","kg", "Empty weight of aircraft"], 
            ["MaxPassenger", "int", "N/A", "Maximum amount of passengers(including pilots) the aircraft can carry"],
            ["MaxWeight", "int/float", "kg", "Maximum take off weight of aircraft"], 
            ["Cargo", "boolean(int 1/0)", "N/A", "Whether the aircraft can carry cargo or not (True(1)/False(0))"], 
            ["WingArea", "int/float", "N/A", "Wing area of aircraft"], 
            ["RateOfClimb", "int/float", "N/A", "Rate of climb of aircraft"]]

        case "Airport": return[
            ["AirportID", "string", "N/A", "* Primary key * // Airport ICAO code"], 
            ["AirportName", "string", "N/A", "Official name of airport"], 
            ["NumberOfRunways", "int","N/A", "Number of runways that are in the airport"],
            [ "Altitude", "int/float", "metres(m)", "Mean altitude/elevation of airport above mean sea level"]]

        case "Coordinates": return[
            ["ID", "int", "N/A", "* Primary key * // Unique number id of the coordinate"], 
            ["SecondaryID", "string", "N/A", "Name of coordinate (eg for an airport coordinate the secondary id will be its airport id)"], 
            ["Latitude", "int/float", "Decimal degree(°)", "Latitude(y) of coordinate(North + // South - ) "], 
            ["Longitude", "int/float", "Decimal degree(°)", "Longitude(x) of coordinate(East + // West - )"], 
            ["Type", "string", "N/A", "Type of coordinate(Airport? VOR? )(Basically airport or waypoint)"], 
            ["Country", "string", "N/A", "ISO country code "], 
            ["Continent", "string", "N/A", "ISO continent code"], 
            ["Associated_Airport", "string", "AirportID", "Airport that links to the coordinate(most coordinates=null)"]]
        case "Engine": return[
            ["EngineID", "string", "N/A", "* Primary key * //Model of engine"], 
            ["TSFC", "int/float", "kilograms per hour per newton(kg/h/N)", "Mass of fuel burn by the engine in one hour divided by 1 Newton of thrust"], 
            ["MaxThrust", "int/float", "kilo Newtons(kN)", "Maximum thrust provided by the engine "], 
            ["Manufacturer", "string", "N/A", "Manufacturer of engine"]]
        case "Runway": return[
            ["RunwayID", "string", "N/A", "* Primary key * // unqiue id of runway(Airport id that it is in + '-' + runway ident(smaller value)(eg 07R))"], 
            ["AirportID", "string", "N/A", "Airport the runway is in"], 
            ["RunwayLength", "int/float", "metres(m)", "Length of runway"], 
            ["RunwayHeading", "int/float", "degrees bearing(° )", "The smaller value of true heading of runway"]]
        default: return []
    }
}

const getTableDescription = (table) =>{
    //get desctiption of each table
    switch(table){
        case "Aircraft": return["This table stores information about different aircraft models. When adding a new aircraft entry, ensure its engine model exists in the 'Engine' table."]
        case "Airport": return["This table stores the main information about airports, coordinates are stored in the 'coordinates' table to keep the database as normalised as it could."]
        case "Coordinates": return["This table stores geographic coordinates for airports, navigation waypoints, and other relevant locations used in flight planning."]
        case "Engine": return["This stores information about different aircraft engines. Data in this table exists independently, but aircraft data depends on data in this table."]
        case "Runway": return["This stores information about all runways in all the airport stored in the 'Airport' table"]
        default: return []
    }
}
const TableDoc = ({table}) =>{
    return(
        <>
            <Flex direction={"column"} align={"center"} justify={"center"} width={"100%"}>
                <Table.Root variant={"outline"} maxW={"800px"} rounded={5}>
                    <Table.Header>
                        <Table.Row>{(["Field", "Data Type", "Unit", "Description"]).map((item, index) => (<Table.Cell key={index}>{item}</Table.Cell>))}</Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {getTableFieldsData(table).map((record, index) => (
                            <Table.Row key={index}>{record.map((data, iindex) => (<Table.Cell key={iindex}>{data}</Table.Cell>))}</Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
                <Flex maxW={"800px"} p={"10px"}>
                    <Text justify="center">
                        {getTableDescription(table)}
                    </Text>
                </Flex>
            </Flex>
        </>
    )
}

const DatabaseDoc = () =>{
    return (
        <Flex direction="column" align="center" justify="center" >
            <Text fontSize={"2xl"}>Database</Text>
            <Tabs.Root lazyMount unmountOnExit defaultValue="Aircraft">
                <Tabs.List>
                    <Tabs.Trigger value="Aircraft">Aircraft</Tabs.Trigger>
                    <Tabs.Trigger value="Airport">Airport</Tabs.Trigger>
                    <Tabs.Trigger value="Coordinates">Coordinates</Tabs.Trigger>
                    <Tabs.Trigger value="Engine">Engine</Tabs.Trigger>
                    <Tabs.Trigger value="Runway">Runway</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="Aircraft">
                    <TableDoc table={"Aircraft"}/>
                </Tabs.Content>
                <Tabs.Content value="Airport">
                    <TableDoc table={"Airport"}/>
                </Tabs.Content>
                <Tabs.Content value="Coordinates">
                    <TableDoc table={"Coordinates"}/>
                </Tabs.Content>
                <Tabs.Content value="Engine">
                    <TableDoc table={"Engine"}/>
                </Tabs.Content>
                <Tabs.Content value="Runway">
                    <TableDoc table={"Runway"}/>
                </Tabs.Content>
                </Tabs.Root>
        </Flex>
    )
}

const CreatePlanHelpPage = () =>{
    // colour for text box for light and dark mode
    const colour = useColorModeValue("gray.200", "gray.900")
    return (
        
        <Flex justify="center" align="center" width="100%" direction={"column"} gap={4} p={6}>
            {/* page title */}
            <Text fontSize={"3xl"} fontWeight={"bold"} textAlign={"center"}>
                Create plan help
            </Text>
            {/* guide image */}
            <Image src="/public/createplanhelp2.png" rounded={5} width={"60%"}/>
            <Box width="70%" textAlign="left" p={4} rounded="lg" boxShadow="sm" bg={colour}>
                <Text fontSize="xl" fontWeight="semibold" mb={2}>
                    Step 1: Choose Departure & Arrival Airports 
                </Text>
                <Text fontSize="md" ml={4}>
                    - Enter the <strong>ICAO code</strong> of both airports.
                </Text>
            </Box>
            <Box width="70%" textAlign="left" p={4} bg={colour} rounded="lg" boxShadow="sm">
                <Text fontSize="xl" fontWeight="semibold" mb={2}>
                    Step 2: Set Flight Altitude ⬆
                </Text>
                <Text fontSize="md" ml={4}>
                    - Enter your desired <strong>cruising altitude</strong> in meters.
                </Text>
            </Box>

            <Box width="70%" textAlign="left" p={4} bg={colour} rounded="lg" boxShadow="sm">
                <Text fontSize="xl" fontWeight="semibold" mb={2}>
                    Step 3: Select an Aircraft 
                </Text>
                <Text fontSize="md" ml={4}>
                    - use the dropdown menu to select from a list of avaible aircrafts in the database.
                </Text>
            </Box>

            <Box width="70%" textAlign="left" p={4} bg={colour} rounded="lg" boxShadow="sm">
                <Text fontSize="xl" fontWeight="semibold" mb={2}>
                    Step 4: (Optional) Set Restricted Airspace 
                </Text>
                <Text fontSize="md" ml={4}>
                    - Click the <strong>"Restricted Airspace"</strong> button to draw or import a restricted area.
                </Text>
            </Box>

            <Box width="70%" textAlign="left" p={4} bg={colour} rounded="lg" boxShadow="sm">
                <Text fontSize="xl" fontWeight="semibold" mb={2}>
                    Step 5: (Optional) Add Plan to Map 
                </Text>
                <Text fontSize="md" ml={4}>
                    - Check the <strong>"Add Plan to Map"</strong> box to visualize the flight path on an interactive map.
                </Text>
            </Box>

            <Box width="70%" textAlign="left" p={4} bg={useColorModeValue("green.200", "green.900")} rounded="lg" boxShadow="sm">
                <Text fontSize="xl" fontWeight="semibold" mb={2} color="green.600">
                    Final Step: Click Calculate 
                </Text>
                <Text fontSize="md" ml={4}>
                    - Click the <strong>"Calculate"</strong> button to generate a flight path.
                </Text>
            </Box>
            <Link to="/createPlan"><Button>Create a plan</Button></Link>
        </Flex>
    )
}
const DocsPage = () => {
    return (
        <>
        <Flex direction={"column"} gap={4} p={6}>
            <Text fontSize={"3xl"} textAlign={"center"}>Documents</Text>
            <Tabs.Root defaultValue='createPlanHelp' variant={"line"} lazyMount fitted >
                <Tabs.List>
                    <Tabs.Trigger value='createPlanHelp'>
                        Create plan help
                    </Tabs.Trigger>
                    <Tabs.Trigger value='database'>
                        Database documents
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="createPlanHelp"><CreatePlanHelpPage/></Tabs.Content>
                <Tabs.Content value="database"><DatabaseDoc/></Tabs.Content>
            </Tabs.Root>
        </Flex>
        </>
    )
}

export default DocsPage
