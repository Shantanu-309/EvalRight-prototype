import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/HeroSection'
import WhyEvalRight from '../components/WhyEvalRight'
import FeaturesGrid from '../components/FeaturesGrid'
import ProcessSteps from '../components/ProcessSteps'
import IndustriesServed from '../components/IndustriesServed'

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Navbar />
      <HeroSection />
      <WhyEvalRight />
      <FeaturesGrid />
      <ProcessSteps />
      <IndustriesServed />
      <Footer />
    </motion.div>
  )
}

