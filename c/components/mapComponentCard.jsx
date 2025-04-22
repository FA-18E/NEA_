// map componnets(manage paths) section (main map view page)
import { BASE_URL } from '@/App';
import { Card, IconButton, Text, Box, Button  } from '@chakra-ui/react'
import { map } from 'leaflet'
import React from 'react'
import { BiTrash } from "react-icons/bi";
import { toaster } from "@/components/ui/toaster"
import { Link } from 'react-router-dom';

const MapComponentCard = ({mapData, reload}) => {
    
    const handleDelete = async (index) =>{
        try {
            const res = await fetch(BASE_URL + "/mapComponents/delete/" + index, {method:"DELETE"})
            const data = await res.json()
            if (!res.ok){
                throw Error(data.error)
            }
            toaster.create({title: "Item deleted", type: "success", duration:"4000"})
            reload()
        } catch (error) {
            toaster.create({title: "Error", type: "error", description: error.message ,duration:"4000"})
        }
    }
    return (
        <Box display="grid" gap={4} m={4}>
            <Text fontSize={"2xl"} fontWeight={"bold"} textAlign={"center"} mb={2} textTransform={"uppercase"}>Manage paths</Text>
            {!mapData || mapData.length === 0 ? (
                // if no map components(ie no path saved)
                <>
                    <Text fontSize="lg" color="red.500" textAlign="center" fontWeight="medium">
                        No paths
                    </Text>
                    <Link to="/createPlan">
                        <Button size="lg" mt={6}>Click here to create a flight path</Button>
                    </Link>
                </>
            ) : 
            // add each component into an item card using a loop
            mapData.map((item, index) =>
                <Card.Root key={index} borderRadius={"lg"} m={4}>
                    <Card.Body>
                        <Card.Title fontWeight="bold" fontSize="lg" color="blue.600">
                            Group name: {item["name"]}
                        </Card.Title>
                        {/* data for each path */}
                        <Card.Description color={"gray.600"} fontSize={"md"}>
                            Path: {item["labels"].join(", ")}
                        </Card.Description>
                        <Card.Description color={"gray.600"} fontSize={"md"}>
                            distance: {item["distance"]} km
                        </Card.Description>
                        {item["polygon"] && 
                        <Card.Description color={"gray.600"} fontSize={"sm"}>
                            Restricted airspace: {item["polygon"].join(", ")}
                        </Card.Description>}
                        <Card.Description color={"gray.600"} fontSize={"md"}>
                            fuel: {item["fuel"]} kg
                        </Card.Description>
                        <Card.Description color={"gray.600"} fontSize={"md"}>
                            time: {item["time"]} hours ≈ {item["time"] * 60} minutes
                        </Card.Description>
                        <Card.Description color={"gray.600"} fontSize={"md"}>
                            altitude: {item["altitude"] / 1000} km
                        </Card.Description>
                    </Card.Body>
                    <Card.Footer display="flex" justifyContent="flex-start">
                        <IconButton variant='ghost' colorPalette='red' size={"sm"} onClick={() => handleDelete(index)}>Delete path from map<BiTrash size={20} /></IconButton> 
                    </Card.Footer>
                </Card.Root>)}
        </Box>
    )
}

export default MapComponentCard
