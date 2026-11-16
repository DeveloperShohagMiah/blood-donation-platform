import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './layouts/Layout'
import Home from './pages/Home'
import BecomeDonor from './pages/Register'
import Login from './pages/Login'
import CreateBloodRequest from './components/CreateBloodRequest'
import FindDonors from './pages/FindDonors'
import About from './pages/About'
import Contact from './pages/Contact'

const App = () => {
  return (
    <>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/become-donor" element={<BecomeDonor />} />

          <Route path="/create-blood-requests" element={<CreateBloodRequest />} />
          <Route path="/donors" element={<FindDonors />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes >
    </>
  )
}

export default App