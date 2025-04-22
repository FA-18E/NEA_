// 404 page
import { Box, Heading, Text, Image, Button } from '@chakra-ui/react'
import React from 'react'
import { Link } from "react-router-dom";

const Error404 = () => {
  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" textAlign="center" p={6}>
        <Heading fontSize="8xl" fontWeight={"bold"}> 404</Heading>
        {/* Message */}
        <Text fontSize="lg" color="gray.500" mt={"30px"}>
          Oops! The page you’re looking for doesn’t exist.
        </Text>
        {/* Button to Go Home */}
        <Link to="/">
          <Button size="lg" mt={6}>
            Click here to go home
          </Button>
        </Link>
        </Box>
    </>
  )
}

export default Error404
