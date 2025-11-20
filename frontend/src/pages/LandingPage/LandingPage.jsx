import React from 'react'
import Header from '../../components/landing/Header'
import Hero from '../../components/landing/Hero'
import Features from '../../components/landing/Features'
import Testimonials from '../../components/landing/Testimonials'
import Faqs from '../../components/landing/Faqs'
import Footer from '../../components/landing/Footer'
import UseCases from '../../components/landing/UseCases'
import Stats from '../../components/landing/Stats'
import HowItWorks from '../../components/landing/HowItWorks'
import Benefits from '../../components/landing/Benefits'

const LandingPage = () => {
  return (
    <div className='bg-[#ffffff] text-gray-600'>
        <Header />
        <main>
            <Hero />
            <Stats />
            <HowItWorks />
            <Benefits />
            <LandingPage />
            <UseCases />
            <Features />
            <Testimonials />
            <Faqs />
        </main>
        <Footer />
    </div>
  )
}

export default LandingPage