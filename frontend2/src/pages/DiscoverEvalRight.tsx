import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import './discover-evalright.css'

export default function DiscoverEvalRight() {
  return (
    <motion.div
      className="discover-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Navbar />
      
      {/* Section 1: Trusted BGV Services Provider USA */}
      <section className="bgv-hero-section">
        <div className="bgv-hero-container">
          <div className="bgv-hero-left">
            <h1 className="bgv-hero-title">Trusted BGV Services Provider USA</h1>
            <p className="bgv-hero-subtitle">
              Reliable and secure background checks customized to meet every business hiring requirement across the industries globally.
            </p>
            <div className="bgv-hero-buttons">
              <button className="bgv-btn bgv-btn-primary">Request Quote</button>
              <Link to="/contact" className="bgv-btn bgv-btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>Contact Expert</Link>
            </div>
          </div>
          <div className="bgv-hero-right">
            <div className="bgv-hero-image-wrapper">
              <img 
                src="/ph1.png" 
                alt="Business professionals" 
                className="bgv-hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Why Choose EvalRight? */}
      <section className="why-choose-section">
        <div className="why-choose-container">
          <h2 className="why-choose-title">Why Choose EvalRight?</h2>
          <p className="why-choose-text">
            Our experience and expertise in background checks makes us offer accurate and efficient services. Our background check professionals use innovative technologies to ensure every BGV check is thorough to enhance hiring quality and reduce risk chances. We guarantee 100% personalized solutions in every step of the verification process.
          </p>
        </div>
      </section>

      {/* Section 3: Our Core Values */}
      <section className="core-values-section">
        <div className="core-values-container">
          <h2 className="core-values-title">Our Core Values</h2>
          <div className="core-values-grid">
            <div className="core-value-card">
              <div className="core-value-header">Accuracy</div>
              <div className="core-value-content">
                Our commitment and attention to detail makes sure every check and verification is precise and reliable.
              </div>
              <div className="core-value-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="28" stroke="#FF2B2B" strokeWidth="2"/>
                  <circle cx="30" cy="30" r="12" fill="#FF2B2B" opacity="0.2"/>
                  <path d="M30 18 L30 30 L38 38" stroke="#FF2B2B" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="30" cy="30" r="4" fill="#FF2B2B"/>
                </svg>
              </div>
            </div>

            <div className="core-value-card">
              <div className="core-value-header">Integrity</div>
              <div className="core-value-content">
                We specialize in offering honest, transparent, and ethical background checks for every niche regardless of size.
              </div>
              <div className="core-value-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="28" stroke="#FF2B2B" strokeWidth="2"/>
                  <path d="M20 30 L26 36 L40 22" stroke="#FF2B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="18" y="20" width="24" height="20" rx="2" stroke="#FF2B2B" strokeWidth="2" fill="none"/>
                </svg>
              </div>
            </div>

            <div className="core-value-card">
              <div className="core-value-header">Security</div>
              <div className="core-value-content">
                EvalRight is No.1 in safeguarding data with high-level security to maintain protection and privacy for every client.
              </div>
              <div className="core-value-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="28" stroke="#FF2B2B" strokeWidth="2"/>
                  <path d="M20 30 L20 24 C20 20 22 18 26 18 L34 18 C38 18 40 20 40 24 L40 30" stroke="#FF2B2B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M24 30 L24 32 C24 36 26 38 30 38 C34 38 36 36 36 32 L36 30" stroke="#FF2B2B" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="30" cy="28" r="2" fill="#FF2B2B"/>
                </svg>
              </div>
            </div>

            <div className="core-value-card">
              <div className="core-value-header">Efficiency</div>
              <div className="core-value-content">
                Our BGV experts provide timely reports with the highest quality and without compromising quality in entire process.
              </div>
              <div className="core-value-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="28" stroke="#FF2B2B" strokeWidth="2"/>
                  <circle cx="30" cy="30" r="12" stroke="#FF2B2B" strokeWidth="2"/>
                  <path d="M30 18 L30 30 L38 30" stroke="#FF2B2B" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="22" y="38" width="16" height="4" rx="2" fill="#FF2B2B"/>
                  <rect x="24" y="44" width="12" height="4" rx="2" fill="#FF2B2B"/>
                </svg>
              </div>
            </div>

            <div className="core-value-card">
              <div className="core-value-header">Customer-Centric</div>
              <div className="core-value-content">
                Our custom solutions are completely customer-centric and or include exceptional support for every need and step.
              </div>
              <div className="core-value-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="28" stroke="#FF2B2B" strokeWidth="2"/>
                  <circle cx="30" cy="22" r="6" stroke="#FF2B2B" strokeWidth="2" fill="none"/>
                  <path d="M18 38 C18 32 23 28 30 28 C37 28 42 32 42 38" stroke="#FF2B2B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M26 22 L28 24 L34 18" stroke="#FF2B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Meet Our Team */}
      <section className="meet-team-section">
        <div className="meet-team-container">
          <h2 className="meet-team-title">
            Meet <span className="meet-team-title-highlight">Our team</span>
          </h2>
          <div className="team-grid">
            <div className="team-member-card">
              <div className="team-member-avatar">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="60" fill="#1E3A8A"/>
                  <circle cx="60" cy="45" r="20" fill="#FFFFFF"/>
                  <path d="M30 100 C30 80 45 70 60 70 C75 70 90 80 90 100" fill="#FFFFFF"/>
                  <rect x="50" y="85" width="20" height="30" fill="#FF2B2B"/>
                  <rect x="45" y="100" width="30" height="20" fill="#1E3A8A"/>
                </svg>
              </div>
              <h3 className="team-member-name">Raghu Adaveni</h3>
              <p className="team-member-role">CEO, EvalRight.us</p>
            </div>

            <div className="team-member-card">
              <div className="team-member-avatar">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="60" fill="#1E3A8A"/>
                  <circle cx="60" cy="45" r="20" fill="#FFFFFF"/>
                  <path d="M30 100 C30 80 45 70 60 70 C75 70 90 80 90 100" fill="#FFFFFF"/>
                  <rect x="50" y="85" width="20" height="30" fill="#FF2B2B"/>
                  <rect x="45" y="100" width="30" height="20" fill="#1E3A8A"/>
                </svg>
              </div>
              <h3 className="team-member-name">Suresh</h3>
              <p className="team-member-role">BDM & Client Support</p>
            </div>

            <div className="team-member-card">
              <div className="team-member-avatar">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="60" fill="#1E3A8A"/>
                  <circle cx="60" cy="45" r="20" fill="#FFFFFF"/>
                  <path d="M30 100 C30 80 45 70 60 70 C75 70 90 80 90 100" fill="#FFFFFF"/>
                  <path d="M45 50 Q60 55 75 50" stroke="#1E3A8A" strokeWidth="2" fill="none"/>
                  <rect x="50" y="85" width="20" height="30" fill="#FF2B2B"/>
                  <rect x="45" y="100" width="30" height="20" fill="#1E3A8A"/>
                </svg>
              </div>
              <h3 className="team-member-name">Anusha</h3>
              <p className="team-member-role">BDM</p>
            </div>

            <div className="team-member-card">
              <div className="team-member-avatar">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="60" fill="#1E3A8A"/>
                  <circle cx="60" cy="45" r="20" fill="#FFFFFF"/>
                  <path d="M30 100 C30 80 45 70 60 70 C75 70 90 80 90 100" fill="#FFFFFF"/>
                  <rect x="50" y="85" width="20" height="30" fill="#FF2B2B"/>
                  <rect x="45" y="100" width="30" height="20" fill="#1E3A8A"/>
                </svg>
              </div>
              <h3 className="team-member-name">Praveen</h3>
              <p className="team-member-role">Client Support</p>
            </div>

            <div className="team-member-card">
              <div className="team-member-avatar">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="60" fill="#1E3A8A"/>
                  <circle cx="60" cy="45" r="20" fill="#FFFFFF"/>
                  <path d="M30 100 C30 80 45 70 60 70 C75 70 90 80 90 100" fill="#FFFFFF"/>
                  <rect x="50" y="85" width="20" height="30" fill="#FF2B2B"/>
                  <rect x="45" y="100" width="30" height="20" fill="#1E3A8A"/>
                </svg>
              </div>
              <h3 className="team-member-name">Ramesh</h3>
              <p className="team-member-role">BDM</p>
            </div>

            <div className="team-member-card">
              <div className="team-member-avatar">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="60" fill="#1E3A8A"/>
                  <circle cx="60" cy="45" r="20" fill="#FFFFFF"/>
                  <path d="M30 100 C30 80 45 70 60 70 C75 70 90 80 90 100" fill="#FFFFFF"/>
                  <rect x="50" y="85" width="20" height="30" fill="#FF2B2B"/>
                  <rect x="45" y="100" width="30" height="20" fill="#1E3A8A"/>
                </svg>
              </div>
              <h3 className="team-member-name">Puneeth</h3>
              <p className="team-member-role">BDM</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </motion.div>
  )
}

