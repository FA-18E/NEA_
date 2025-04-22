// delete item from DB
import { BASE_URL } from '@/App';
import { Dialog, IconButton, Portal, Button, CloseButton, Text } from '@chakra-ui/react'
import React, { useState }from 'react'
import { BiTrash } from "react-icons/bi";
import { toaster } from "@/components/ui/toaster"

const DeleteItem = ({itemID, table, primKey, reload}) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleSubmit = async (e) =>{
        e.preventDefault()
        try {
            // delete data with item id
            const res = await fetch(BASE_URL + "/database/delete/" + table + "/" + itemID, {
                method:"DELETE",
            })
            const data = await res.json()
            if (!res.ok){ // bad response
                throw Error(data.error)
            }
            toaster.create({title: "Item deleted", type: "success", duration:"4000"})
            setIsOpen(false)  // close delete data card
            reload()  // reload main db page to show 
        } catch (error) {
            toaster.create({title: "Error", type: "error", description: error.message ,duration:"4000"})
        }
    }
    return (
        <>
            <Dialog.Root lazyMount open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Trigger asChild>
                    <IconButton variant='ghost' colorPalette='red' size={"sm"}><BiTrash size={20} /></IconButton> 
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop/>
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <form onSubmit={handleSubmit}>
                                <Dialog.Header>
                                    <Dialog.Title>Delete ID:{itemID}</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                <Text fontWeight="medium" >Delete item {primKey} : {itemID} ?</Text>
                                <Text fontSize="sm" fontWeight="bold" marginTop="10px" textTransform="uppercase">
                                    this action is irreversible !
                                </Text>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Button type={"submit"}>yes</Button>
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

export default DeleteItem
