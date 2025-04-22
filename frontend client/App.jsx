import { useState } from 'react'
import Navbar from './components/navbar'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import DataBase from './components/database'
import Error404 from './components/404'
import MapView from './components/mapView'
import { Toaster } from './components/ui/toaster'
import CreatePlan from './components/CreatePlan'
import DocsPage from './components/DocsPage'


export const BASE_URL = "http://127.0.0.1:8080"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Toaster/>
        <Navbar/> 
        <Routes>
          <Route path="/" element={<MapView/>}/>
          <Route path="*" element={<Error404/>}/>
          <Route path="/database" element={<DataBase/>}/>
          <Route path="/createPlan" element={<CreatePlan/>}/>
          <Route path="/docs" element={<DocsPage/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
