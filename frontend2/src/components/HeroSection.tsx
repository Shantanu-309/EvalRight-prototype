import { Link } from 'react-router-dom'
import './hero.css'

export default function HeroSection() {
  return (
    <section className="hero-container">
      {/* Background Gradients */}
      <div className="hero-background">
        <div className="base-gradient"></div>
        <div className="radial-gradient"></div>
      </div>

      {/* Cloud Dispersion Animation */}
      <div className="cloud-container">
        <div className="cloud-blob cloud-1"></div>
        <div className="cloud-blob cloud-2"></div>
        <div className="cloud-blob cloud-3"></div>
        <div className="cloud-blob cloud-4"></div>
        <div className="cloud-blob cloud-5"></div>
        <div className="cloud-blob cloud-6"></div>
      </div>

      {/* Main Content */}
      <div className="hero-content">
        {/* Left Column */}
        <div className="hero-left" style={{ width: '100%', maxWidth: '800px' }}>
          <h1 className="hero-heading">
            Verify with<br />Confidence
          </h1>
          
          <p className="hero-paragraph">
            EvalRight provides comprehensive identity verification, background checks, and document authentication services. Our platform enables businesses to verify candidates, clients, and partners with industry-leading accuracy and speed, ensuring trust and security in every transaction.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Request Demo</Link>
            <Link to="/contact" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>Contact Us</Link>
          </div>
        </div>

      </div>

      {/* Bottom Stats Marquee */}
      <div className="stats-marquee-wrapper">
        <div className="stats-marquee-track">
          <div className="stats-marquee-strip">
            <div className="stats-number">10000+</div>
            <div className="stats-label">Verifications</div>
          </div>
          <div className="stats-marquee-strip">
            <div className="stats-number">5000+</div>
            <div className="stats-label">Clients</div>
          </div>
          <div className="stats-marquee-strip">
            <div className="stats-number">Global</div>
            <div className="stats-label">Coverage</div>
          </div>
          <div className="stats-marquee-strip">
            <div className="stats-number">Fast &</div>
            <div className="stats-label">Accurate Results</div>
          </div>
          <div className="stats-marquee-strip">
            <div className="stats-number">99.9%</div>
            <div className="stats-label">Uptime</div>
          </div>
          {/* Duplicate for seamless loop */}
          <div className="stats-marquee-strip">
            <div className="stats-number">10000+</div>
            <div className="stats-label">Verifications</div>
          </div>
          <div className="stats-marquee-strip">
            <div className="stats-number">5000+</div>
            <div className="stats-label">Clients</div>
          </div>
          <div className="stats-marquee-strip">
            <div className="stats-number">Global</div>
            <div className="stats-label">Coverage</div>
          </div>
          <div className="stats-marquee-strip">
            <div className="stats-number">Fast &</div>
            <div className="stats-label">Accurate Results</div>
          </div>
          <div className="stats-marquee-strip">
            <div className="stats-number">99.9%</div>
            <div className="stats-label">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  )
}

