import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './features.css'

const features = [
  {
    id: 'authentication',
    title: 'Authentication & User Management',
    subtitle: 'Secure authentication and granular role control.',
    route: '/features/authentication'
  },
  {
    id: 'client-management',
    title: 'Client Management',
    subtitle: 'Manage organizations, branches, and settings.',
    route: '/features/client-management'
  },
  {
    id: 'candidate-management',
    title: 'Candidate Management',
    subtitle: 'End-to-end candidate onboarding and tracking.',
    route: '/features/candidate-management'
  },
  {
    id: 'bgv-orders',
    title: 'BGV Orders',
    subtitle: 'Complete lifecycle management for background checks.',
    route: '/features/bgv-orders'
  },
  {
    id: 'package-management',
    title: 'Package & Component Management',
    subtitle: 'Flexible BGV packages and component structures.',
    route: '/features/package-management'
  },
  {
    id: 'billing',
    title: 'Billing & Invoicing',
    subtitle: 'Integrated billing, payments, and invoicing workflow.',
    route: '/features/billing'
  },
  {
    id: 'vendor-integration',
    title: 'Vendor Integration (IDA)',
    subtitle: 'Automated verification via IDA API.',
    route: '/features/vendor-integration'
  },
  {
    id: 'admin',
    title: 'Admin Features',
    subtitle: 'Full administrative control and system configuration.',
    route: '/features/admin'
  },
  {
    id: 'candidate-portal',
    title: 'Candidate Portal',
    subtitle: 'Self-service portal for profiles and documents.',
    route: '/features/candidate-portal'
  },
  {
    id: 'webhooks',
    title: 'Webhooks & Integration',
    subtitle: 'External event handling and system integrations.',
    route: '/features/webhooks'
  },
  {
    id: 'compliance',
    title: 'Compliance & Audit',
    subtitle: 'Logging, tracking, and compliance workflows.',
    route: '/features/compliance'
  },
  {
    id: 'background-jobs',
    title: 'Background Jobs',
    subtitle: 'Async job queue for emails, invoices, vendor calls.',
    route: '/features/background-jobs'
  },
  {
    id: 'document-management',
    title: 'Document Management',
    subtitle: 'Document uploads, approval, and status tracking.',
    route: '/features/document-management'
  },
  {
    id: 'reporting',
    title: 'Reporting & Analytics',
    subtitle: 'Activity, finance, and verification reporting.',
    route: '/features/reporting'
  }
]

export default function FeaturesGrid() {
  return (
    <section className="features-section">
      <div className="features-container">
        <h2 className="features-title">Platform Features</h2>
        <p className="features-subtitle">Explore our comprehensive background verification platform</p>
        
        <motion.div 
          className="features-grid"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.route}
              className="feature-block"
            >
              <h3 className="feature-block-title">{feature.title}</h3>
              <p className="feature-block-description">{feature.subtitle}</p>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
