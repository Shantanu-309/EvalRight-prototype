import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import './bgv-india.css'

export default function BGVIndia() {
  const cardVariants = {
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

  const services = [
    {
      number: '01',
      title: 'Address Verification in India',
      description: 'Address Verification in India validates candidates both permanent and current residential details to ensure authenticity of identity and accurate background information.'
    },
    {
      number: '02',
      title: 'Education Verification in India',
      description: 'Education Verification in India validates schooling, degrees, diplomas, and institutions-based certificates to confirm whether they are genuine academic records or not and to prevent fraudulent educational claims.'
    },
    {
      number: '03',
      title: 'Criminal Verification in India',
      description: 'Criminal Verification in India checks criminal records such as court records, police files, and legal databases to identify history of fraud, crime, etc., ensuring safer and more reliable hiring decisions.'
    },
    {
      number: '04',
      title: 'Employment Verification in India',
      description: 'Employment Verification in India checks previous jobs - roles, employers, tenure, and responsibilities, ensuring accurate work history and protecting against falsified career details.'
    },
    {
      number: '05',
      title: 'ID Check in India',
      description: 'Identity Checks in India authenticates government-issued identification documents such as Aadhaar, PAN, Passport, driving license, etc., ensuring candidates submitted valid identity proofs.'
    },
    {
      number: '06',
      title: 'Drug Test in India (5 & 10 Panel)',
      description: 'Drug Test in India (5 & 10 Panel) screens candidates for prohibited substances, ensuring a safe, productive, and compliant workplace environment.'
    },
    {
      number: '07',
      title: 'Reference Check in India',
      description: 'Reference Check in India gathers direct insights from personal or professional references, verifying candidates\' skills, workplace performance, and behavior effectively.'
    },
    {
      number: '08',
      title: 'Credit Check in India',
      description: 'Credit Check in India evaluates candidates\' financial reliability by analysing bank statements, outstanding loans, repayment history, and credit behavior, ensuring trustworthy and dependable employees.'
    },
    {
      number: '09',
      title: 'Form 16 AS Verification in India',
      description: 'Form 16 AS Verification in India cross-verifies tax returns and salary declarations, ensuring transparency, and accuracy in candidates\' financial records.'
    },
    {
      number: '10',
      title: 'Gap Check in India',
      description: 'Gap Check in India identifies academic and career breaks, validating provided reasons, ensuring consistency, and highlighting transparency in candidates\' professional journeys.'
    }
  ]

  return (
    <motion.div
      className="bgv-india-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Navbar />

      {/* Section 1: Red Banner Header */}
      <section className="bgv-india-header">
        <div className="bgv-india-header-container">
          <h1 className="bgv-india-header-title">
            Background Verification Services India – EvalRight
          </h1>
        </div>
      </section>

      {/* Section 2: Key Features */}
      <section className="bgv-india-features-section">
        <div className="bgv-india-features-container">
          <div className="bgv-india-features-left">
            <div className="bgv-india-features-image-wrapper">
              <img 
                src="/ph1.png" 
                alt="Professional working on laptop" 
                className="bgv-india-features-image"
              />
            </div>
          </div>
          <div className="bgv-india-features-right">
            <h2 className="bgv-india-features-title">
              Key Features of Background Verification in India
            </h2>
            <ul className="bgv-india-features-list">
              <li className="bgv-india-feature-item">
                <span className="bgv-india-feature-icon">»</span>
                <div>
                  <strong>Risk Reduction:</strong> Employment and Education Verification in India. This ensures candidates' academic qualifications and work history are genuine, helping employers hire with confidence and avoid misrepresentation.
                </div>
              </li>
              <li className="bgv-india-feature-item">
                <span className="bgv-india-feature-icon">»</span>
                <div>
                  <strong>Enhanced Safety:</strong> Criminal and Court Record Checks in India. This identifies any past criminal activities or pending cases, ensuring a safer and more compliant workplace environment for organizations.
                </div>
              </li>
              <li className="bgv-india-feature-item">
                <span className="bgv-india-feature-icon">»</span>
                <div>
                  <strong>Informed Decision-Making:</strong> Identity and Address Verification in India. This validates government-issued IDs and residential details, ensuring accuracy of personal information and reducing risks of fraudulent identities.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3: Why EvalRight */}
      <section className="bgv-india-why-section">
        <div className="bgv-india-why-container">
          <div className="bgv-india-why-left">
            <h2 className="bgv-india-why-title">
              Why EvalRight for Background Checks in India?
            </h2>
            <p className="bgv-india-why-text">
              Choosing EvalRight means choosing accuracy, speed, and compliance. Our team combines expertise with advanced technology to deliver reliable results every time. We understand the local and regulatory landscape in India, ensuring each check is lawful and thorough. With EvalRight, you gain a trusted partner who protects your business reputation and helps you hire with peace of mind.
            </p>
          </div>
          <div className="bgv-india-why-right">
            <div className="bgv-india-why-image-wrapper">
              <img 
                src="/ph1.png" 
                alt="Professional woman with laptop" 
                className="bgv-india-why-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Services List */}
      <section className="bgv-india-services-section">
        <div className="bgv-india-services-container">
          <h2 className="bgv-india-services-title">
            <span className="bgv-india-services-title-red">BACKGROUND</span>{' '}
            <span className="bgv-india-services-title-purple">VERIFICATION SERVICES IN INDIA</span>
          </h2>
          <p className="bgv-india-services-description">
            Our background verification services in India are designed to ensure authenticity, compliance, and trust at every stage of the hiring process and standards of every industry.
          </p>

          <div className="bgv-india-services-grid">
            {services.map((service, index) => (
              <motion.div
                key={service.number}
                className="bgv-india-service-card"
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={cardVariants}
              >
                <div className="bgv-india-service-number">{service.number}</div>
                <div className="bgv-india-service-checkmark">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="bgv-india-service-title">{service.title}</h3>
                <p className="bgv-india-service-description">{service.description}</p>
                {/* Official icon placeholder - Replace with provided icon image for {service.title} */}
                <div className="bgv-india-service-icon">
                  {/* Icon will be provided */}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </motion.div>
  )
}

