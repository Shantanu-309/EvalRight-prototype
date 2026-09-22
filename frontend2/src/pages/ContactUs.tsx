import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import './contact-us.css'

export default function ContactUs() {
  const [userType, setUserType] = useState<'business' | 'individual'>('business')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phoneCode: '+91',
    phone: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', { ...formData, userType })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <motion.div
      className="contact-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Navbar />

      {/* Section 1: Get In Touch */}
      <section className="contact-hero-section">
        <div className="contact-hero-container">
          <div className="contact-hero-left">
            <h1 className="contact-hero-title">Get In Touch</h1>
            <h2 className="contact-hero-subtitle">Find Our Expert Support Team For Custom Queries</h2>
            <p className="contact-hero-text">
              Connect with us for tailored BGV solutions! For immediate queries or custom quotes, we are here to assist 24/7 in a hassle-free way.
            </p>
          </div>
          <div className="contact-hero-right">
            <div className="contact-hero-image-wrapper">
              <img 
                src="/ph1.png" 
                alt="Support team" 
                className="contact-hero-image"
              />
            </div>
          </div>
        </div>

        {/* Three Cards Below Hero */}
        <div className="contact-cards-section">
          <div className="contact-cards-container">
            <div className="contact-card">
              <div className="contact-card-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="25" fill="#7C3AED" opacity="0.2"/>
                  <circle cx="30" cy="20" r="8" fill="#7C3AED"/>
                  <path d="M15 45 C15 35 22 30 30 30 C38 30 45 35 45 45" stroke="#7C3AED" strokeWidth="2" fill="none"/>
                  <circle cx="30" cy="30" r="12" stroke="#7C3AED" strokeWidth="1.5" fill="none" strokeDasharray="2 2"/>
                  <path d="M25 25 L30 20 L35 25" stroke="#7C3AED" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <p className="contact-card-text">
                As a Customer, I need support with my account-related queries
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="25" r="6" fill="#7C3AED"/>
                  <circle cx="30" cy="20" r="6" fill="#A24CFF"/>
                  <circle cx="40" cy="25" r="6" fill="#A78BFA"/>
                  <path d="M15 35 L20 30 M25 35 L30 30 M35 35 L40 30" stroke="#7C3AED" strokeWidth="1.5" fill="none"/>
                  <rect x="12" y="40" width="36" height="8" rx="4" fill="#7C3AED" opacity="0.3"/>
                </svg>
              </div>
              <p className="contact-card-text">
                As a Prospect, I'm interested to connect with your sales team.
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="15" y="12" width="30" height="36" rx="2" fill="#90EE90" opacity="0.3"/>
                  <path d="M22 25 L27 30 L38 19" stroke="#90EE90" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="45" cy="20" r="8" fill="#FF2B2B" opacity="0.2"/>
                  <path d="M40 20 L45 15 L50 20 M45 15 L45 25" stroke="#FF2B2B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="contact-card-text">
                As an Individual, I'm seeking support with BGV process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Get In Touch Today */}
      <section className="contact-form-section">
        <div className="contact-form-container">
          <div className="contact-form-left">
            <h2 className="contact-form-title">Get In Touch Today</h2>
            <p className="contact-form-description">
              Get in touch to experience the dedicated and personalized support in guiding every step in choosing the right BGV services for your requirement.
            </p>
            
            <ul className="contact-features-list">
              <li className="contact-feature-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="#7C3AED" strokeWidth="2"/>
                  <path d="M6 10 L9 13 L14 7" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Custom and client-centric</span>
              </li>
              <li className="contact-feature-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="#7C3AED" strokeWidth="2"/>
                  <path d="M6 10 L9 13 L14 7" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Reliable and accurate</span>
              </li>
              <li className="contact-feature-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="#7C3AED" strokeWidth="2"/>
                  <path d="M6 10 L9 13 L14 7" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Dedicated account managers</span>
              </li>
            </ul>

            <div className="contact-info">
              <div className="contact-info-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.0695 12.9612 11.0388 14.9305 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <span className="contact-info-label">USA:</span>
                  <span className="contact-info-value">+1 331-255-0045</span>
                </div>
              </div>
              <div className="contact-info-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.0695 12.9612 11.0388 14.9305 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <span className="contact-info-label">INDIA:</span>
                  <span className="contact-info-value">+91 81436 58801</span>
                </div>
              </div>
              <div className="contact-info-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <span className="contact-info-value">contact@evalright.us</span>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-right">
            <div className="contact-form-card">
              <div className="contact-form-header">
                <h3 className="contact-form-header-title">Hello! Let's Schedule!!</h3>
              </div>
              
              <div className="contact-form-tabs">
                <button
                  type="button"
                  className={`contact-form-tab ${userType === 'business' ? 'active' : ''}`}
                  onClick={() => setUserType('business')}
                >
                  Business
                </button>
                <button
                  type="button"
                  className={`contact-form-tab ${userType === 'individual' ? 'active' : ''}`}
                  onClick={() => setUserType('individual')}
                >
                  Individual
                </button>
              </div>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-field">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-form-field">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required={userType === 'business'}
                  />
                </div>

                <div className="contact-form-field">
                  <label htmlFor="phone">Phone</label>
                  <div className="contact-phone-input">
                    <select
                      name="phoneCode"
                      value={formData.phoneCode}
                      onChange={handleChange}
                      className="contact-phone-code"
                    >
                      <option value="+1">+1</option>
                      <option value="+91">+91</option>
                      <option value="+44">+44</option>
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter 10 digit number"
                      className="contact-phone-number"
                      required
                    />
                  </div>
                </div>

                <div className="contact-form-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </div>

                <button type="submit" className="contact-form-submit">
                  SEND
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </motion.div>
  )
}

