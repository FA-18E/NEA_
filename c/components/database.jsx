// database page main
import { Container, Field, Grid, NativeSelect, For, Text, Box, Switch } from '@chakra-ui/react'
import React, { useState } from 'react'
import DbGrid from './databaseGrid'

const DataBase = () => {

    const [table, setTable] = useState("-")
    return (
        <>
            <Box display="flex" flexDirection="column" alignItems="center" gap="10px" p="10px">
                <Field.Root w="100%" display="flex" flexDirection="column" alignItems="center" gap="5px" maxW="1000px">
                    <Field.Label fontSize="xl">Table</Field.Label>
                    <NativeSelect.Root>
                        <NativeSelect.Field name="Table" onChange={(t)=>{setTable(t.target.value)}} flex={"auto"}>
                            <For each={["-","Aircraft", "Airport", "Coordinates", "Engine", "Runway"]}>
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
            </Box>
            <br/>
            {/* if table is not yet selected -> text : pls select one | otherwise return database grid component */}
            {table !== "-" ? <DbGrid key={table} table={table}></DbGrid>: <Text fontSize="3xl" fontWeight="semibold" textAlign="center" mt={6}>Please select a table</Text>}
        </>
  )
}

export default DataBase
