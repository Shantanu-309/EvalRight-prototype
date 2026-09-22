import './industries.css'

const industries = [
  { name: 'Financial Services & Banking', icon: '🏦' },
  { name: 'Education', icon: '🎓' },
  { name: 'Energy & Utilities', icon: '⚡' },
  { name: 'Healthcare & Life Sciences', icon: '🏥' },
  { name: 'Government', icon: '🏛️' },
  { name: 'Hospitality', icon: '🏨' },
  { name: 'Manufacturing', icon: '🏭' },
  { name: 'Marketplace & Gig', icon: '🛒' },
  { name: 'Non-Profit', icon: '🤝' },
  { name: 'Retail', icon: '🏪' },
  { name: 'Technology', icon: '💻' },
  { name: 'Transportation', icon: '✈️' }
]

export default function IndustriesServed() {
  return (
    <section className="industries-section">
      <div className="industries-container">
        <h2 className="industries-title">Industries Served</h2>
        <p className="industries-subtitle">
          EvalRight offers comprehensive background check services across various industries, ensuring tailored solutions that meet specific sector needs. Below are the key industries we serve.
        </p>
        
        <div className="industries-grid">
          {industries.map((industry, index) => (
            <div key={index} className="industry-card">
              <div className="industry-icon-wrapper">
                <div className="industry-icon-diamond">
                  <span className="industry-icon">{industry.icon}</span>
                </div>
              </div>
              <h3 className="industry-name">{industry.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

