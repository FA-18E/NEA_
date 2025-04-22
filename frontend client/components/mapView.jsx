// map view main 
import {Container, Flex } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import "./mapview.css"
import { MapContainer, TileLayer, Polygon, Polyline, LayerGroup, LayersControl, CircleMarker, Tooltip } from 'react-leaflet'
import { BASE_URL } from '@/App'
import { toaster } from "@/components/ui/toaster"
import { IoReload } from "react-icons/io5";
import MapComponentCard from './mapComponentCard'
import { ScaleControl } from 'react-leaflet' 

const yorkshire_polygon = [
    [54.6125, -2.2231], [54.4784, -1.6969], [54.3874, -1.3419], [54.2773, -0.6142], [54.1363, -0.3009], [53.9630, -0.4313], 
    [53.7485, -0.3684], [53.6947, -1.0705], [53.6183, -1.3414], [53.5207, -1.5097], [53.3831, -1.4669], [53.4376, -1.7480], 
    [53.6252, -1.9408], [53.8651, -1.9149], [54.0076, -2.1687], [54.1645, -2.4061], [54.2892, -2.4526], [54.4031, -2.3476], 
    [54.6125, -2.2231]   
]

const randomPath = [[ 51.4706, -0.461941], [ 51.48720169067383, -0.4666669964790344], 
    [52.07419967651367, -0.6107919812202454], [53.28139877319336, -0.9472219944000244], 
    [57.559200286865234, -1.8172199726104736],[ 59.87889862060547, -1.2866699695587158], 
    [59.87889862060547, -1.295560002326965]
]



const MapView = () => {
    const [reload, setReload] = useState(false)  // reload state
    const [mapData, setMapData] = useState([])  // fetched map data

    useEffect(() =>{
        const getComponents = async () =>{
            try {
                const res = await fetch(BASE_URL + "/mapComponents/get", {method:"GET", headers:{"Content-Type": "application/json"}})
                const data = await res.json()  // stringify json
                if (!res.ok){  // bad response
                    throw new Error(data.error);
                }
                toaster.create({title:"data fetched", type:"success", duration:"4000"})
                setMapData(data)  // set map data
            } catch (error) {
                toaster.create({title: "Error", type: "error", description: error.message ,duration:"4000"})
            }
        }
        getComponents()
    }, [reload]) // load when relaod is changed (true <=> false)   
    const colourOptions = [{color:"red"}, {color:"green"}, {color:"blue"}, {color: "purple"}]
    return (
        <>
        {/* {console.log(mapData)}
        {console.log(typeof mapData)} */}
        <Container>
            <Flex direction={"column"} align={"center"} justify={"center"} width={"100%"}>
                <MapContainer center={[54.5644, -2.6324]} zoom={6} scrollWheelZoom={true} style={{width:"80%", height:"75vh"}}>
                    <ScaleControl position="bottomleft" />{/* show map scale on bottom left */}
                    {/* map tile */}
                    <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* map layer control -> different layers = different component/path */}
                    <LayersControl position='topright'>
                        {mapData.map((item, index)=>(
                            <Flex key={index}>

                                {/* add layer group */}
                                <LayersControl.Overlay checked name={item["name"]} key={index+"path"}>
                                    <LayerGroup key={index+"lg1"}>
                                        {/* plot path */}
                                        <Polyline positions={item["path"]} pathOptions={(colourOptions[index%4])} key={index+"line"}/>
                                        {/* for each point(node) on path add a marker and add the node id */}
                                        {item["labels"].map((label, iindex) =>
                                            <CircleMarker center={item["path"][iindex]} pathOptions={(colourOptions[index%4])}
                                            radius={6}  key={index+"circle-marker"+iindex}>
                                                <Tooltip>{label}</Tooltip>
                                            </CircleMarker>
                                        )}
                                    </LayerGroup>
                                </LayersControl.Overlay>
                                {/* only render when items[2] is null /// items[2] is the list of vertices for the restricted airspace polygon */}
                                {item["polygon"] &&
                                <LayersControl.Overlay checked name={item["name"] + "-restricted_airspace"} key={index+"restricted"}>
                                    <LayerGroup key={index+"lg2"}>
                                        {/* plot restircted airspace polygon */}
                                        <Polygon positions={item["polygon"]} pathOptions={(colourOptions[index%4])}  key={index+"polygon"}/>
                                    </LayerGroup>
                                </LayersControl.Overlay>
                                }
                            </Flex>
                        ))}
                    </LayersControl>
                </MapContainer>
                <MapComponentCard mapData={mapData} reload={() => setReload(prev => !prev)}/>
            </Flex>
        </Container>
        
        </>
    )
}

export default MapView
