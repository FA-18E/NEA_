// search in DB
import { BASE_URL } from '@/App';
import { Box, Field, Fieldset, Input, NativeSelect, For, Button } from '@chakra-ui/react'
import { toaster } from "@/components/ui/toaster"
import {React, useState} from 'react'
import { IoIosSearch } from "react-icons/io";


const SearchDb = ({fieldlist, table, onSearchResult}) => {
    const filteredFields = fieldlist.map(item => item === "Edit/Delete"? "-": item); // filter out the item 'edit/delete'

    const [isLoading, setIsLoading] = useState(false)

    const [searchItems, setSearchItems] = useState(
        {
            searchItem:"",
            field:"-"
        }
    )
    const handleSubmitSearch = async(e) =>{
        e.preventDefault() // prevent reload
        setIsLoading(true)  // load spinner
        try {
            const res = await fetch(BASE_URL + "/database/search/" + table + "/" + 
                encodeURIComponent(searchItems.field) + "/" + 
                encodeURIComponent(searchItems.searchItem),{
                method:"GET",
                headers:{
                    "Content-Type": "application/json"
                }
            })
            const data =await res.json()
            if (!res.ok){ // bad response
                throw new Error(data.error);
            }
            onSearchResult(data)
            if (data.length === 0){  // no data retunred -> not found in db
                toaster.create({title:"404", type:"warning", description:"No records found", duration:"4000"})
            }
        } catch (error) {
            // alert user
            // throw new Error(data.error);
            console.log(error.message)
            toaster.create({title: "Error", type: "error", description: error.message ,duration:"4000"})
        } finally{
            // reset search item field
            setSearchItems({searchItem:"", field:"-"})
        } 
    }

    return (
        <Box p={4} mx="auto" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <form onSubmit={handleSubmitSearch} style={{ width: "100%", maxWidth: "1000px" }}>
                <Fieldset.Root gap={4} display="flex" flexDirection="column" maxW="1000px" alignItems="center" textAlign={"center"}>
                    <Field.Root>
                        <Field.Label>Search item</Field.Label>
                        <Input name="search" value={searchItems.searchItem} onChange={(e) => setSearchItems({...searchItems, searchItem: e.target.value})} placeholder="Search..."/>
                    </Field.Root>
                    <Field.Root>
                        <Field.Label>Select a field</Field.Label>
                        <NativeSelect.Root>
                            <NativeSelect.Field name="Field" flex={"auto"} value={searchItems.field} onChange={(e) => setSearchItems({...searchItems, field: e.target.value})}>
                                    <For each={filteredFields}>
                                        {(item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                        )}
                                    </For>
                                </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                    </Field.Root> 
                </Fieldset.Root>

                <Button type="submit" variant={"outline"} textAlign={"center"} mt={3} rounded={5} borderWidth={"1px"}
                mx="auto" display={"flex"} justifyContent={"center"} alignItems={"center"} width={"350px"}
                disabled={searchItems.field === "-"? true:false}>
                    <IoIosSearch />Search
                </Button>
                {/* <Button onClick={handleClear} variant={"outline"} fontWeight={"medium"}>Clear</Button> */}
                
            </form>
            
        </Box>
    )
}

export default SearchDb
