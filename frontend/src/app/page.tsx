"use client"
import { CallToAction } from "../sections/CallToAction"
import { Features } from "../sections/Features"
import { Footer } from "../sections/Footer"
import { Header } from "../sections/Header"
import { Hero } from "../sections/Hero"
import { LogoTicker } from "../sections/LogoTicker"
import { StatsComparison } from "../components/StatsComparison"
import { HowItWorks } from "../components/HowItWorks"
import { Testimonials } from "../sections/Testimonials"

export default function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <CallToAction />
      <HowItWorks />
      <Testimonials />
      <StatsComparison />
      <Footer />
    </>
  )
}