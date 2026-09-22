import { motion } from 'framer-motion'
import './why-evalright.css'

export default function WhyEvalRight() {
  const imageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        delay: i * 0.1
      }
    })
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        delay: i * 0.1 + 0.2
      }
    })
  }

  return (
    <section className="why-evalright-section">
      <div className="why-evalright-container">
        <h2 className="why-evalright-title">Why EvalRight?</h2>
        <p className="why-evalright-subtitle">
          We always strive to ensure the best possible hire for your company with accuracy, confidence, and efficiency.
        </p>

        <div className="why-evalright-content">
          {/* Left Side: 2x2 Image Grid */}
          <div className="why-evalright-images">
            <motion.div
              className="why-evalright-image-tile"
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={imageVariants}
            >
              <div className="image-placeholder image-accuracy">
                <svg width="100%" height="100%" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="300" height="300" rx="12" fill="#F5F5F5"/>
                  <rect x="50" y="50" width="200" height="250" rx="4" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="2"/>
                  <circle cx="150" cy="100" r="30" fill="#E0E0E0"/>
                  <text x="150" y="110" textAnchor="middle" fontSize="40" fill="#999">?</text>
                  <text x="150" y="160" textAnchor="middle" fontSize="14" fill="#333" fontWeight="600">Name</text>
                  <text x="150" y="180" textAnchor="middle" fontSize="12" fill="#666">Summary</text>
                  <text x="150" y="200" textAnchor="middle" fontSize="12" fill="#666">Contact</text>
                  <text x="150" y="220" textAnchor="middle" fontSize="12" fill="#666">Experie...</text>
                  <circle cx="200" cy="80" r="25" fill="#FF2B2B" opacity="0.8"/>
                  <path d="M185 80 L195 90 L215 70" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.div>

            <motion.div
              className="why-evalright-image-tile"
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={imageVariants}
            >
              <div className="image-placeholder image-speed">
                <svg width="100%" height="100%" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="300" height="300" rx="12" fill="#F5F5F5"/>
                  <rect x="30" y="100" width="240" height="120" rx="4" fill="#8B4513" opacity="0.3"/>
                  <circle cx="120" cy="160" r="15" fill="#654321"/>
                  <circle cx="180" cy="160" r="15" fill="#654321"/>
                  <rect x="50" y="80" width="200" height="4" fill="#8B4513"/>
                  <rect x="60" y="200" width="60" height="40" rx="2" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1"/>
                  <rect x="130" y="200" width="60" height="40" rx="2" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1"/>
                  <rect x="200" y="200" width="60" height="40" rx="2" fill="#7C3AED" opacity="0.3" stroke="#E0E0E0" strokeWidth="1"/>
                  <circle cx="90" cy="70" r="8" fill="#90EE90"/>
                </svg>
              </div>
            </motion.div>

            <motion.div
              className="why-evalright-image-tile"
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={imageVariants}
            >
              <div className="image-placeholder image-adaptability">
                <svg width="100%" height="100%" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="300" height="300" rx="12" fill="#F5F5F5"/>
                  <rect x="50" y="80" width="200" height="180" rx="4" fill="#1A1A1A"/>
                  <rect x="70" y="100" width="160" height="4" fill="#FFFFFF" opacity="0.3"/>
                  <rect x="70" y="120" width="120" height="4" fill="#FFFFFF" opacity="0.3"/>
                  <rect x="70" y="140" width="140" height="4" fill="#FFFFFF" opacity="0.3"/>
                  <circle cx="200" cy="200" r="3" fill="#7C3AED"/>
                  <circle cx="220" cy="180" r="3" fill="#7C3AED"/>
                  <circle cx="180" cy="180" r="3" fill="#7C3AED"/>
                  <path d="M200 200 L220 180 M200 200 L180 180" stroke="#7C3AED" strokeWidth="1" opacity="0.5"/>
                  <circle cx="100" cy="220" r="15" fill="#7C3AED" opacity="0.3"/>
                  <circle cx="150" cy="240" r="12" fill="#7C3AED" opacity="0.3"/>
                </svg>
              </div>
            </motion.div>

            <motion.div
              className="why-evalright-image-tile"
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={imageVariants}
            >
              <div className="image-placeholder image-placeholder-4">
                <svg width="100%" height="100%" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="300" height="300" rx="12" fill="#F5F5F5"/>
                  <rect x="50" y="50" width="200" height="200" rx="4" fill="#E8F4F8"/>
                  <circle cx="150" cy="120" r="40" fill="#7C3AED" opacity="0.2"/>
                  <path d="M110 150 L150 110 L190 150 L150 190 Z" fill="#7C3AED" opacity="0.3"/>
                  <circle cx="150" cy="150" r="8" fill="#7C3AED"/>
                </svg>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Value Cards */}
          <div className="why-evalright-cards">
            <motion.div
              className="why-evalright-card"
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={cardVariants}
            >
              <h3 className="why-evalright-card-title">Accuracy</h3>
              <p className="why-evalright-card-text">
                Our skilled analysts use advanced verification tools and proven methodologies, making it possible to deliver highly accurate background checks that reduce risk to almost zero — ensuring you hire with confidence.
              </p>
            </motion.div>

            <motion.div
              className="why-evalright-card"
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={cardVariants}
            >
              <h3 className="why-evalright-card-title">Speed</h3>
              <p className="why-evalright-card-text">
                Our processes are optimized for rapid verification, real-time case handling, and on-time evaluation. We deliver results faster than industry norms without compromising quality.
              </p>
            </motion.div>

            <motion.div
              className="why-evalright-card"
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={cardVariants}
            >
              <h3 className="why-evalright-card-title">Adaptability</h3>
              <p className="why-evalright-card-text">
                We offer customized and flexible verification solutions tailored to your business needs. Whether you are a startup or enterprise, our team adapts seamlessly to your workflow.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}


