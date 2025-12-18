import React from 'react'
import Header from '../../layouts/Header/Header'
import { Outlet } from 'react-router-dom'
import Footer from '../../layouts/Footer/Footer'
import CalendarDN from '../../components/CalendarDN/CalendarDN'

export default function HomeScreent() {
  return (
    <>
     <Header></Header>
     <CalendarDN/>
     <main> 
        <Outlet/>
     </main>
     <Footer></Footer>
    </>
  )
}
