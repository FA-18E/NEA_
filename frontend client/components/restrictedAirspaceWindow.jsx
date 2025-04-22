// restricted airspace input window
import { Dialog, Portal, Button, CloseButton, Field, Input, FileUpload, Box, VStack, Textarea, InputGroup, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, GeoJSON } from 'react-leaflet';
import { LuUpload } from "react-icons/lu";
import { ScaleControl } from 'react-leaflet';
import { toaster } from "@/components/ui/toaster";

const RestrictedAirspaceWindow = ( { airspaceVertexList }) => {
    const [restrictedAirspace, setRestrictedAirspace] = useState([]); // stores coord list of restricted airspace
    const [inputField, setInputField] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    
    // Handle file upload and extract coordinates
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsedGeoJson = JSON.parse(e.target.result);

                    // Extract coordinates from GeoJSON
                    if (parsedGeoJson.features && parsedGeoJson.features.length > 0) {
                        const firstFeature = parsedGeoJson.features[0]; // Assuming single polygon
                        if (firstFeature.geometry.type === "Polygon") {
                            // GeoJson-> [lon, lat] , this application -> [lat, lon]
                            // maps lon lat to lat lon
                            const coordinates = firstFeature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                            setRestrictedAirspace(coordinates);
                        } else {
                            toaster.create({ title: "Warning", type: "warning", 
                                description: "Only Polygon type GeoJSON is supported.", duration: 4000});
                        }
                    } else {
                        toaster.create({ title: "Error", type: "error", 
                            description: "Invalid GeoJSON structure.", duration: 4000});
                    }
                } catch (error) {
                    toaster.create({ title: "Error", type: "error", 
                        description: "Invalid GeoJSON file. Please upload a valid .geojson file.", duration: 4000});
                }
            };
            reader.readAsText(file);
        }
    };

    // Handle form submission to return only the coordinates list
    const handleSubmitForm = (e) => {
        e.preventDefault();  // prevent relaod
        console.log(inputField)
        if (restrictedAirspace.length === 0 && inputField === "" ) {  // no vertices uploaded -> error
            toaster.create({ title: "Warning", type: "warning", 
                description: "No valid coordinates available. Upload a valid GeoJSON file first.", duration: 4000
            });
            return;
        }
        if (inputField !== ""){
            try {
                const parsedData = JSON.parse(inputField); // Convert string to array
                if (Array.isArray(parsedData) && parsedData.every(coord => Array.isArray(coord) && coord.length === 2)) {
                    setRestrictedAirspace(parsedData); // map each coord in string to a list item
                } else {
                    toaster.create({title: "Warning", type: "warning", description: 
                        "Invalid format. Ensure input is a valid list of [latitude, longitude] pairs.",duration:"4000"})
                    // alert("Invalid format. Ensure input is a valid list of [latitude, longitude] pairs.");
                }
            } catch (error) {
                toaster.create({title: "Warning", type: "warning", description: 
                    "Error parsing input. Ensure it's a valid JSON array.",duration:"4000"})
                // alert("Error parsing input. Ensure it's a valid JSON array.");
            }
        }
        console.log("Extracted Coordinates:", restrictedAirspace);
        return restrictedAirspace; // Only return the list of coordinates
    };

    const handleimportRestricted = (e) =>{
        airspaceVertexList(restrictedAirspace)  // set return value
        setIsOpen(false)  // close window
        setRestrictedAirspace([]) // reset fields
        
    }
    return (
        <>
            <Dialog.Root size={"xl"} open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Trigger asChild><Button>Import Restricted Airspace</Button></Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title fontSize="2xl" fontWeight="bold">Restricted Airspace</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Box>
                                    <MapContainer center={[54.5644, -2.6324]} zoom={6} scrollWheelZoom={true} style={{ width: "100%", height: "40vh" }}>
                                        <ScaleControl position="bottomleft" />
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {restrictedAirspace.length > 0 && (
                                            <Polygon positions={restrictedAirspace} pathOptions={{ color: "red" }} />
                                        )}
                                    </MapContainer>

                                    <VStack spacing={4} mt={4} align="center">
                                        <Field.Root>
                                            <Field.Label>Enter vertex list</Field.Label>
                                            <Textarea value={inputField} onChange={(e) => setInputField(e.target.value)} size={"md"} resize={"vertical"}/>
                                        </Field.Root>
                                        <Text>OR</Text>
                                        <Field.Root>
                                            <Field.Label>Upload GeoJson/Json File(Polygon in file only)</Field.Label>
                                            <Input type="file" accept=".geojson, application/json" onChange={handleFileUpload} border={"none"} p={2}/>
                                        </Field.Root>

                                        <Button maxW={"20%"} onClick={handleSubmitForm}>Show Area on Map</Button>
                                    </VStack>
                                </Box>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button onClick={handleimportRestricted}>Import</Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}

export default RestrictedAirspaceWindow;
