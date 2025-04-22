// navbar
import { Box, Button, Container, Flex, Text, IconButton, Icon, Menu, Portal, Show, useBreakpointValue } from '@chakra-ui/react'
import React from 'react'
import {useColorMode, useColorModeValue} from "@/components/ui/color-mode"
import { LuMoon, LuSun, LuMenu } from 'react-icons/lu'
import { FaDatabase, FaFighterJet } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { IoDocumentSharp } from "react-icons/io5";

const Navbar = () => {
    const { toggleColorMode, colorMode } = useColorMode()
    const screenSize = useBreakpointValue({ sm: "mobile", md: "notMobile"}); // define show condition

    return (
        <Container maxW={"1200px"}>
            <Box px={4} my={4} borderRadius={5} bg={useColorModeValue("gray.300", "gray.700")}>
                <Flex h="16" alignItems={"center"} justifyContent={"space-between"}>
                    <Flex alignItems={"center"} justifyContent={"center"} gap={3} display={{base:"none", sm:"flex"}}>
                        <Link to="/"><Text fontSize={{base:"lg", md:"3xl"}} justifyContent={"center"}>F/A-18E/F</Text></Link>
                    </Flex>
                    {/* show if screen is normal size */}
                    <Show when={screenSize === "notMobile"}>
                        <Flex gap={3} alignItems={"center"}>
                            <Flex>
                                <Link to="/createPlan">
                                    <Button>Create Plan<FaFighterJet /></Button>
                                </Link>
                            </Flex>
                            <Flex>
                                <Link to="/database">
                                    <Button>Database<FaDatabase/></Button>
                                </Link>
                            </Flex>
                            <Flex>
                                <Link to="/docs">
                                    <Button>Docs<IoDocumentSharp /></Button>
                                </Link>
                            </Flex>
                            <IconButton onClick={toggleColorMode}>
                                {colorMode === "light" ? <LuSun /> : <LuMoon />}
                            </IconButton>
                        </Flex>

                    </Show>
                    {/* show if screen is small */}
                    <Show when={screenSize === "mobile"}>
                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button><LuMenu/></Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content>
                                    <Link to="/createPlan"><Menu.Item value="Create Plan">Create Plan</Menu.Item></Link>
                                    <Link to="/database"><Menu.Item value="Database">Database</Menu.Item></Link>
                                    <Link to="/docs"><Menu.Item value="Docs">Docs</Menu.Item></Link>
                                    <Menu.Item onClick={toggleColorMode} value="colourMode">{colorMode === "light" ? <LuSun /> : <LuMoon />}</Menu.Item>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                    </Show>
                </Flex>
            </Box>
        </Container>
    )
}

export default Navbar
