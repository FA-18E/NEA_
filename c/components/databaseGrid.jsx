// database table grid 
import { BASE_URL } from '@/App'
import { Box, Text, Table, Spinner, IconButton, Button, Flex } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import SearchDb from './SearchDb';
import ItemCard from './itemCard';
import DeleteItem from './deleteItem';
import { toaster } from "@/components/ui/toaster"
import CreateNew from './CreateNew';
import { IoReload } from "react-icons/io5";

const getField = (table) =>{
    switch(table){
        // switch table name
        // edit/delete field is the place where the update and delete button will be placed
        case "Aircraft":
            return ["AircraftID", "MaxFuelLoad", "CruiseSpeed", "MaxAltitude", "EngineID", 
                "NumberOfEngines", "Manufacturer", "EmptyWeight", "MaxPassenger",
                "MaxWeight", "Cargo", "WingArea", "RateOfClimb", "Edit/Delete"
            ]
        case "Airport":
            return ["AirportID", "AirportName", "NumberOfRunways", "Altitude", "Edit/Delete"]

        case "Coordinates":
                return ["ID", "SecondaryID", "Latitude", "Longitude", "Type", 
                    "Country", "Continent", "Associated_Airport", "Edit/Delete"]

        case "Engine":
            return ["EngineID", "TSFC", "MaxThrust", "Manufacturer", "Edit/Delete"]
            
        case "Runway":
            return ["RunwayID", "AirportID" , "RunwayLength", "RunwayHeading", "Edit/Delete"]
        default:
            return []  // return empty list otherwise(unlikely to happen)
    }
}


const DbGrid = ({table}) => {

    const [isLoading, setIsLoading] = useState(true)
    const [dataItem, setDataItem] = useState([])  // actual data records
    const [dbField, setDbField] = useState([])  // table fields 
    const [searchResults, setSearchResults] = useState(null);  // search item returns
    const [reload, setReload] = useState(false)

    useEffect(() =>{
        if (!table || table === "-")return;

        setDbField(getField(table))
        const getData = async() =>{
            try {
                // fetch data
                const res = await fetch(BASE_URL + "/database/" + table,{
                    method:"GET",
                    headers:{
                        "Content-Type": "application/json"
                    }
                })
                const data = await res.json()

                if (!res.ok){  // bad response
                    toaster.create({title:"Error", type:"error", description: data.error, duration:"4000"})
                    throw new Error(data.error)
                    
                }
                setDataItem(data)  // set return data 
                setSearchResults(null)  // reset search input fields
            } catch (error) {
                console.error(error)  // log error in console
                // notify user
                toaster.create({title:"Error", type:"error", description: error.message, duration:"4000"})
            } finally {
                // set loading false to remove spinner
                setIsLoading(false)
            }
        }
       
        setIsLoading(true); // set loading state true -> render spinner
        setDataItem([])  // reset item before fetching
        getData() // call get data function
    
    },[table, reload])

    // console.log(dataItem.length)
    //console.log(dataItem)
    // console.log(dbField)

    const handleSearchResults = (results) => {
        setSearchResults(results);
    };
    
    return (
        <>
            {/* Loading Spinner */}
            {isLoading && (
                    <Box textAlign="center" my={4}>
                        <Spinner size="xl" color="gray.500" />
                    </Box>
                )}
            {/* No Data Message */}
            {!isLoading && dataItem.length === 0 && (
                <Text fontSize="lg" color="gray.500" textAlign="center" p={10}>
                    No data available for this table.
                </Text>
            )}
            <Flex justify={"center"} align={"center"} gap={4} my={4}>
                <CreateNew table={table} reload={() => setReload(prev => !prev)}/>
                <IconButton onClick={() => setReload(prev => !prev)} variant={"outline"}><IoReload/></IconButton>
            </Flex >
            <SearchDb fieldlist={dbField} table={table} onSearchResult={handleSearchResults}/>
            <Box justifyContent={"center"} width={"100%"}>
            <Flex direction="column" align="center" justify="center">
                <Table.ScrollArea borderWidth={"1px"} maxW={(table === "Aircraft"? "90%" : {sm:"90%", lg: "80%"})}rounded={3}>
                    <Table.Root variant={"outline"} rounded={5} maxW={{sm:"90%", base:"70%"}}  minW={{xl:"900px"}} >
                        <Table.Header>
                            <Table.Row>
                                {dbField.map((fieldname) => (<Table.ColumnHeader key={fieldname}>{fieldname}</Table.ColumnHeader>))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {/* {console.log(searchResults)}
                            {console.log(dataItem.length)} */}
                            {(Array.isArray(searchResults) && searchResults.length > 0? searchResults: dataItem).map((data, index) => (
                                <Table.Row key={index}>
                                    {/* maps the correct item to the correct field */}
                                    {dbField.map((fieldname, iindex) => 
                                    <Table.Cell key={iindex}>
                                        {fieldname === "Edit/Delete" ?(
                                        <> {/* if fieldname is equal to Edit/Delete -> show icon*/}
                                            <ItemCard dataitems={data} 
                                            fields={dbField} table={table} reload={() => setReload(prev => !prev)}/>
                                            <DeleteItem table={table} itemID={data[dbField[0]]} primKey={dbField[0]} reload={() => setReload(prev => !prev)}/>
                                        </>) : 
                                            <>{data[fieldname]}</>}
                                </Table.Cell>)}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </Flex>
            </Box>
        </>
        
    )
}

export default DbGrid
export {getField}
