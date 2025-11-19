import React from 'react'
import Hero from './../Components/Hero/Hero';
import AboutHome from './../Components/AboutHome/AboutHome';
import ServicesHome from '../Components/Services/ServicesHome';
import HowItWorks from '../Components/Works/HowItWorks';

function Home() {
    return (
        <>
            <Hero />
            <AboutHome />
            <ServicesHome />
            <HowItWorks />
        </>
    )
}

export default Home