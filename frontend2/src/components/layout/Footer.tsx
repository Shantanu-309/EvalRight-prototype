import { Link } from 'react-router-dom'
import './footer.css'

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Left Column: Logo and Company Info */}
          <div className="footer-column footer-company">
            <div className="footer-logo">
              <span className="footer-logo-er">ER</span>
              <div className="footer-logo-text">
                <span className="footer-logo-name">EVALRIGHT</span>
                <span className="footer-logo-tagline">Screen before Hire</span>
              </div>
            </div>
            <p className="footer-description">
              Employment Background Check Services Provider for Organizations of all Sizes. Get Fast Results & Improve Your Quality of Hire with EvalRight!
            </p>
            <p className="footer-benefits">
              Accurate Results | Low Price Guarantee | Wide Range of Services
            </p>
            <div className="footer-social">
              <h4 className="footer-social-title">Social Media</h4>
              <div className="footer-social-icons">
                <a href="#" className="footer-social-icon" aria-label="Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17V10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="footer-social-icon" aria-label="LinkedIn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="footer-social-icon" aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.815C15.2063 14.5778 14.5932 15.2242 13.8416 15.6845C13.0901 16.1448 12.2285 16.3987 11.3501 16.4194C10.4716 16.4401 9.60082 16.2269 8.83164 15.8037C8.06246 15.3805 7.42269 14.762 6.98088 14.0107C6.53908 13.2594 6.31079 12.4007 6.31462 11.53C6.31844 10.6593 6.55422 9.80278 7.00281 9.05536C7.4514 8.30794 8.09533 7.69482 8.86656 7.27501C9.63779 6.8552 10.5099 6.64338 11.3884 6.66458C12.2669 6.68577 13.1282 6.93906 13.879 7.39931C14.6299 7.85955 15.2431 8.50948 15.6516 9.27541C16.0601 10.0413 16.2498 10.8943 16.203 11.7479" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" className="footer-social-icon" aria-label="Pinterest">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 16.42 4.87 20.17 8.84 21.49C8.71 20.78 8.61 19.78 8.82 18.82L9.84 14.26C9.84 14.26 9.5 13.54 9.5 12.5C9.5 11.17 10.17 10.1 11.02 10.1C11.73 10.1 12.12 10.68 12.12 11.37C12.12 12.15 11.6 13.22 11.18 14.11C10.88 14.78 11.4 15.35 12.1 15.35C13.35 15.35 14.3 14.2 14.3 12.5C14.3 11.15 13.4 10.1 11.9 10.1C10.15 10.1 9.15 11.5 9.15 12.75C9.15 13.5 9.55 14.1 10.2 14.1C10.4 14.1 10.6 14 10.7 13.8C10.75 13.7 10.85 13.4 10.9 13.25C10.95 13.1 10.95 13 10.95 12.9C10.95 12.5 10.6 12.2 10.1 12.2C9.4 12.2 8.7 12.9 8.7 13.95C8.7 14.8 9.1 15.5 9.6 15.5C9.7 15.5 9.8 15.5 9.9 15.4C9.5 16.5 9.1 17.5 8.8 18.2C8.5 19.1 8.1 19.9 7.7 20.5C8.5 20.8 9.4 21 10.3 21C16.52 21 21.6 16.42 21.6 12C21.6 6.48 16.52 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="footer-social-icon" aria-label="YouTube">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8386 5.15941C21.498 4.80824 21.0697 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.42C2.9303 4.55318 2.502 4.80824 2.16137 5.15941C1.82073 5.51057 1.57881 5.94541 1.46 6.42C1.14521 8.16156 0.991236 9.93078 1 11.705C0.991236 13.4792 1.14521 15.2484 1.46 16.99C1.59096 17.4649 1.8383 17.8979 2.17814 18.2431C2.51799 18.5883 2.93882 18.8336 3.4 18.96C5.12 19.38 12 19.38 12 19.38C12 19.38 18.88 19.38 20.6 18.96C21.0697 18.8336 21.498 18.5883 21.8386 18.2431C22.1793 17.8979 22.4212 17.4649 22.54 16.99C22.8538 15.2484 23.0078 13.4792 22.9986 11.705C23.0078 9.93078 22.8538 8.16156 22.54 6.42Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.75 15.02L15.5 11.705L9.75 8.39V15.02Z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" className="footer-social-icon" aria-label="X (Twitter)">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2L15 8L22 9L18 14L22 22L14 17L8 22L9 14L2 13L8 8L5 2L12 7L18 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-column">
            <h4 className="footer-column-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/discover-evalright" className="footer-link">Discover Evalright</Link></li>
              <li><Link to="/bgv-india" className="footer-link">BGV India</Link></li>
              <li><Link to="#" className="footer-link">Blog</Link></li>
              <li><Link to="#" className="footer-link">Careers</Link></li>
              <li><Link to="#" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="#" className="footer-link">FAQ</Link></li>
              <li><Link to="#" className="footer-link">Terms & Conditions</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Our Services Column */}
          <div className="footer-column">
            <h4 className="footer-column-title">Our Services</h4>
            <ul className="footer-links">
              <li><Link to="#" className="footer-link">CDLIS</Link></li>
              <li><Link to="#" className="footer-link">Civil Verification</Link></li>
              <li><Link to="#" className="footer-link">Criminal Background Verification</Link></li>
              <li><Link to="/bgv-india" className="footer-link">Background Verification Services India</Link></li>
              <li><Link to="#" className="footer-link">Driving History</Link></li>
              <li><Link to="#" className="footer-link">Drug Screening</Link></li>
              <li><Link to="#" className="footer-link">Education Verification</Link></li>
              <li><Link to="#" className="footer-link">Employment Verification</Link></li>
              <li><Link to="#" className="footer-link">Financial PEP Screening</Link></li>
              <li><Link to="#" className="footer-link">Occupational Verification</Link></li>
              <li><Link to="#" className="footer-link">Professional License Verification</Link></li>
              <li><Link to="#" className="footer-link">Reference Verification</Link></li>
              <li><Link to="#" className="footer-link">SSN Trace</Link></li>
            </ul>
          </div>

          {/* Contact Information Column */}
          <div className="footer-column">
            <div className="footer-contact-block">
              <h4 className="footer-contact-title">USA - Aurora</h4>
              <p className="footer-contact-address">
                3831 McCoy Dr Unit 101 B, Aurora, IL 60504, United States
              </p>
              <div className="footer-contact-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a href="mailto:contact@evalright.us" className="footer-contact-link">contact@evalright.us</a>
              </div>
              <div className="footer-contact-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.33333 4.16667C3.33333 3.24619 4.07952 2.5 5 2.5H7.27924C7.70967 2.5 8.09181 2.77543 8.22792 3.18377L9.7257 7.67721C9.8831 8.14932 9.6694 8.66531 9.2243 8.88787L6.96701 10.0165C8.0695 12.4612 10.0388 14.4305 12.4835 15.533L13.6121 13.2757C13.8347 12.8306 14.3507 12.6169 14.8228 12.7743L19.3162 14.2721C19.7246 14.4082 20 14.7903 20 15.2208V17.5C20 18.4205 19.2538 19.1667 18.3333 19.1667H17.3333C8.04906 19.1667 1.33333 12.451 1.33333 3.16667V2.16667C1.33333 1.24619 2.07952 0.5 3 0.5H5C5.92048 0.5 6.66667 1.24619 6.66667 2.16667V4.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a href="tel:+13312550045" className="footer-contact-link">+1 331-255-0045</a>
              </div>
            </div>

            <div className="footer-contact-block">
              <h4 className="footer-contact-title">INDIA - Hyderabad</h4>
              <p className="footer-contact-address">
                Naspur House, 5th Floor, Himayatnagar, Hyderabad, 500029
              </p>
              <div className="footer-contact-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 6.66667L10 11.6667L17.5 6.66667M3.33333 15H16.6667C17.5871 15 18.3333 14.2538 18.3333 13.3333V6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V13.3333C1.66667 14.2538 2.41286 15 3.33333 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a href="mailto:contact@evalright.us" className="footer-contact-link">contact@evalright.us</a>
              </div>
              <div className="footer-contact-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.33333 4.16667C3.33333 3.24619 4.07952 2.5 5 2.5H7.27924C7.70967 2.5 8.09181 2.77543 8.22792 3.18377L9.7257 7.67721C9.8831 8.14932 9.6694 8.66531 9.2243 8.88787L6.96701 10.0165C8.0695 12.4612 10.0388 14.4305 12.4835 15.533L13.6121 13.2757C13.8347 12.8306 14.3507 12.6169 14.8228 12.7743L19.3162 14.2721C19.7246 14.4082 20 14.7903 20 15.2208V17.5C20 18.4205 19.2538 19.1667 18.3333 19.1667H17.3333C8.04906 19.1667 1.33333 12.451 1.33333 3.16667V2.16667C1.33333 1.24619 2.07952 0.5 3 0.5H5C5.92048 0.5 6.66667 1.24619 6.66667 2.16667V4.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a href="tel:+918143658801" className="footer-contact-link">+91 81436 58801</a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>Copyright © 2025 EvalRight All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

