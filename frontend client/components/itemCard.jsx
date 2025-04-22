// edit item from DB
import { BASE_URL } from '@/App';
import { Dialog, IconButton, Portal, Button, CloseButton, Input, Fieldset, Field } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { FaRegEdit } from "react-icons/fa";
import { toaster } from "@/components/ui/toaster"

const ItemCard = ({dataitems, fields, table, reload }) => {
    const filteredFields = fields.filter(item => item !== "Edit/Delete")  // filter out the item 'edit/delete'
    const [updatedData, setUpdatedData] = useState(dataitems)  // set updated data
    const ITEM_ID = dataitems[filteredFields[0]]
    const [isOpen, setIsOpen] = useState(false)

    // reset when search returns data
    useEffect(() => {
        if (isOpen) {
            setUpdatedData(dataitems) // Reset to original data when opening
        }
    }, [isOpen, dataitems]);

    
    // hanlde update save
    const handleSubmit = async (e) =>{
        e.preventDefault()  // prevent reload
        console.log(updatedData)
        try {
            // fetch data
            const res = await fetch(BASE_URL + "/database/update/" + table +"/"+ ITEM_ID, 
                {   method:"PATCH", 
                    headers:{
                    "Content-Type": "application/json"},
                    body: JSON.stringify(updatedData)
                })
            const data = await res.json()
            console.log(data)
            if (!res.ok){  // bad response
                throw Error(data.error)
            }
            toaster.create({title:"Data updated", type:"success", duration:"4000"})
            setIsOpen(false)  // close card
            reload() // reload main DB page
        } catch (error) {
            // error message
            toaster.create({title:"Error", type:"error", description: error.message, duration:"4000"})
        } 
    }
    return (
        <>
            <Dialog.Root lazyMount open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Trigger asChild>
                    <IconButton variant={"ghost"}><FaRegEdit /></IconButton>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop/>
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <form onSubmit={handleSubmit}>
                                <Dialog.Header>
                                    <Dialog.Title>Edit ID:{ITEM_ID}</Dialog.Title>
                                </Dialog.Header>
                                
                                <Dialog.Body>
                                    
                                    <Fieldset.Root>

                                        {filteredFields.map((field, index) =>(
                                            <Field.Root key={index}>
                                                <Field.Label>{field}</Field.Label>
                                                <Input value={(updatedData[field] !== null ? updatedData[field] ?? "" : "-")} onChange={(e) => setUpdatedData({...updatedData, [field]: e.target.value})} 
                                                disabled={index===0?true:false}/>{/* if field index = 0 -> primary id of data -> disable input field -> cannot be changed*/}
                                            </Field.Root>
                                        ))}

                                    </Fieldset.Root>
                                    
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Button type={"submit"}>Save</Button>
                                </Dialog.Footer>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                </Dialog.CloseTrigger>
                            </form>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

        </>
    )
}

export default ItemCard
