// create new DB record
import { BASE_URL } from '@/App';
import { Dialog, IconButton, Portal, Button, CloseButton, Input, Fieldset, Field, Text } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { IoIosAdd } from "react-icons/io";
import { getField} from './databaseGrid'
import { toaster } from "@/components/ui/toaster"

const CreateNew = ({table, reload}) => {
    const [isOpen, setIsOpen] = useState(false)
    // remove edit/delete from field
    const filteredFields = getField(table).filter(item => item !== "Edit/Delete")

    // Re-fetch fields when dialog opens
    const [newData, setNewData] = useState({});
    
    console.log(newData)

    const handleSubmit = async (e) =>{
        e.preventDefault()  // prevent reload
        try {
            // send data
            const res = await fetch(BASE_URL + "/database/add/" + table, {
                method:"POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify(newData)
            })
            const data = await res.json()
            if (!res.ok){  // bad response
                throw new Error(data.error);
            }
            toaster.create({title:"New data added", type:"success", duration:"4000"})
            setIsOpen(false)  // close create new card
            reload() // reload main db page to show new data in table
        } catch (error) {
            toaster.create({title:"Error", type:"error", description: error.message, duration:"4000"})
        }
    }
    return (
        <>
            <Dialog.Root lazyMount open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Trigger asChild>
                    <Button variant={"outline"} fontSize={"sm"}><IoIosAdd/>Create new record</Button>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop/>
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <form onSubmit={handleSubmit}>
                                <Dialog.Header>
                                    <Dialog.Title>Create new record</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <Fieldset.Root>
                                        {
                                            filteredFields.map((field, index) =>(
                                                <Field.Root key={index} required>
                                                    <Field.Label>{field}<Field.RequiredIndicator /></Field.Label>
                                                    <Input onChange={(e) => setNewData({...newData, [field]: e.target.value})}/>
                                                </Field.Root>
                                            ))
                                        }
                                    </Fieldset.Root>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Button type={"submit"}>Add</Button>
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

export default CreateNew
