import { Link } from 'react-router-dom'
import './feature-grid.css'

const features = [
  {
    id: 'authentication',
    title: 'Authentication & User Management',
    description: 'Secure user authentication and role-based access control',
    route: '/features/authentication'
  },
  {
    id: 'client-management',
    title: 'Client Management',
    description: 'Comprehensive client organization and branch management',
    route: '/features/client-management'
  },
  {
    id: 'candidate-management',
    title: 'Candidate Management',
    description: 'End-to-end candidate lifecycle and profile management',
    route: '/features/candidate-management'
  },
  {
    id: 'bgv-orders',
    title: 'Background Verification (BGV) Orders',
    description: 'Complete order management and status tracking system',
    route: '/features/bgv-orders'
  },
  {
    id: 'package-management',
    title: 'Package & Component Management',
    description: 'Flexible BGV packages and component configurations',
    route: '/features/package-management'
  },
  {
    id: 'billing',
    title: 'Billing & Invoicing',
    description: 'Automated billing, invoicing, and payment processing',
    route: '/features/billing'
  },
  {
    id: 'vendor-integration',
    title: 'Vendor Integration (IDA)',
    description: 'Seamless integration with IDA for background checks',
    route: '/features/vendor-integration'
  },
  {
    id: 'admin',
    title: 'Admin Features',
    description: 'Powerful admin dashboard and system controls',
    route: '/features/admin'
  },
  {
    id: 'candidate-portal',
    title: 'Candidate Portal',
    description: 'Self-service portal for candidate onboarding',
    route: '/features/candidate-portal'
  },
  {
    id: 'webhooks',
    title: 'Webhooks & Integration',
    description: 'Webhook processing and external system integration',
    route: '/features/webhooks'
  },
  {
    id: 'compliance',
    title: 'Compliance & Audit',
    description: 'Comprehensive audit logs and compliance tracking',
    route: '/features/compliance'
  },
  {
    id: 'background-jobs',
    title: 'Background Jobs',
    description: 'Async job processing and task queue management',
    route: '/features/background-jobs'
  },
  {
    id: 'document-management',
    title: 'Document Management',
    description: 'Document upload, storage, and approval workflows',
    route: '/features/document-management'
  },
  {
    id: 'reporting',
    title: 'Reporting & Analytics',
    description: 'Comprehensive reports and analytics dashboard',
    route: '/features/reporting'
  }
]

export default function FeatureGrid() {
  return (
    <section className="feature-grid-section">
      <div className="feature-grid-container">
        <h2 className="feature-grid-title">Platform Features</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.route}
              className="feature-block"
            >
              <h3 className="feature-block-title">{feature.title}</h3>
              <p className="feature-block-description">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

