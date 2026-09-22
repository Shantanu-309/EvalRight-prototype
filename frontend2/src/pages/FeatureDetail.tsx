import { useParams, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Footer from '../components/layout/Footer'
import './feature-detail.css'

const featureData: Record<string, {
  title: string
  intro: string
  features: string[]
}> = {
  'authentication': {
    title: 'Authentication & User Management',
    intro: 'Secure and flexible authentication system with comprehensive user management capabilities.',
    features: [
      'User accounts with email/password authentication',
      'JWT-based authentication with refresh tokens',
      'Role-based access control (Admin, Client Admin, Client User, Candidate)',
      'User profiles with personal information',
      'Session management',
      'Email verification'
    ]
  },
  'client-management': {
    title: 'Client Management',
    intro: 'Complete client organization management with multi-branch support and flexible configurations.',
    features: [
      'Client organization management',
      'Client groups (Enterprise, SMB, etc.)',
      'Multiple branches per client',
      'Client contacts (billing, technical)',
      'Client settings and configurations',
      'Client registration forms',
      'Client status management (Prospect, Active, Suspended, Terminated)',
      'Tax exemption handling',
      'Custom package overrides per client'
    ]
  },
  'candidate-management': {
    title: 'Candidate Management',
    intro: 'End-to-end candidate lifecycle management from invitation to verification completion.',
    features: [
      'Candidate profiles and information',
      'Candidate invitations via email/SMS',
      'Candidate status tracking (Invited, Profile Pending, Awaiting Documents, In Verification, Clear, Adverse, Withdrawn)',
      'Candidate task management (Personal Info, Address History, Employment, Education)',
      'Document upload and management',
      'Candidate timeline/activity tracking'
    ]
  },
  'bgv-orders': {
    title: 'Background Verification (BGV) Orders',
    intro: 'Comprehensive order management system for tracking verification requests from creation to completion.',
    features: [
      'Order creation and management',
      'Order status tracking (Draft, Awaiting Candidate, In Progress, Clear, Adverse, Closed, Cancelled)',
      'Multiple BGV packages',
      'Component-based verification (Employment, Criminal, Education, Identity, etc.)',
      'Component status tracking per order',
      'Order events and timeline',
      'Support for US and India regions',
      'Integration with IDA (vendor) for verification'
    ]
  },
  'package-management': {
    title: 'Package & Component Management',
    intro: 'Flexible package and component system for customizable background verification services.',
    features: [
      'BGV component catalog (Employment, Criminal, Education, Identity checks)',
      'Pre-built BGV packages',
      'Custom packages per client',
      'Component requirements and configurations',
      'Document requirements per package/component',
      'Regional support (US, India, Both)'
    ]
  },
  'billing': {
    title: 'Billing & Invoicing',
    intro: 'Integrated payment processing and comprehensive invoicing system with multiple billing modes.',
    features: [
      'Stripe integration for payments',
      'Billing customers management',
      'Payment methods (cards, ACH)',
      'Invoices with line items',
      'Invoice status tracking (Draft, Sent, Paid, Overdue)',
      'Payment tracking',
      'Prepaid and postpaid billing modes',
      'Autopay functionality',
      'Tax calculations',
      'Client transactions ledger'
    ]
  },
  'vendor-integration': {
    title: 'Vendor Integration (IDA)',
    intro: 'Seamless integration with IDA for automated background verification processing.',
    features: [
      'IDA API integration for background checks',
      'Case management with IDA',
      'Component-level status from IDA',
      'Webhook handling for status updates',
      'Job role mapping'
    ]
  },
  'admin': {
    title: 'Admin Features',
    intro: 'Comprehensive admin dashboard with full system control and management capabilities.',
    features: [
      'Admin dashboard and controls',
      'Client onboarding and approval',
      'Package management',
      'System configuration',
      'Audit logging',
      'User role management'
    ]
  },
  'candidate-portal': {
    title: 'Candidate Portal',
    intro: 'Self-service portal enabling candidates to complete their verification process independently.',
    features: [
      'Self-service portal for candidates',
      'Profile completion',
      'Document upload',
      'Task completion tracking',
      'Order status viewing',
      'Invitation acceptance'
    ]
  },
  'webhooks': {
    title: 'Webhooks & Integration',
    intro: 'Robust webhook system for real-time integration with external systems and services.',
    features: [
      'Webhook event processing (IDA, Stripe)',
      'External system integration',
      'Event tracking and logging'
    ]
  },
  'compliance': {
    title: 'Compliance & Audit',
    intro: 'Comprehensive compliance and audit system ensuring regulatory adherence and full traceability.',
    features: [
      'Audit logs for all key actions',
      'Timeline events for candidates and orders',
      'Document approval workflow',
      'Consent management'
    ]
  },
  'background-jobs': {
    title: 'Background Jobs',
    intro: 'Asynchronous job processing system for handling time-intensive tasks efficiently.',
    features: [
      'Job queue for async processing',
      'Email sending',
      'Invoice generation',
      'Vendor API calls'
    ]
  },
  'document-management': {
    title: 'Document Management',
    intro: 'Secure document handling system with approval workflows and status tracking.',
    features: [
      'Document upload and storage',
      'Document type requirements',
      'Document approval/rejection workflow',
      'Document status tracking'
    ]
  },
  'reporting': {
    title: 'Reporting & Analytics',
    intro: 'Comprehensive reporting and analytics dashboard for insights into platform usage and performance.',
    features: [
      'Order status reports',
      'Client activity tracking',
      'Financial reports (invoices, payments)',
      'Candidate verification status reports'
    ]
  }
}

export default function FeatureDetail() {
  const { featureId } = useParams<{ featureId: string }>()
  const feature = featureId ? featureData[featureId] : null

  if (!feature) {
    return (
      <div className="feature-detail-container">
        <div className="feature-detail-content">
          <h1>Feature Not Found</h1>
          <Link to="/" className="back-button">Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="feature-detail-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <div className="feature-detail-background">
        <div className="base-gradient"></div>
        <div className="radial-gradient"></div>
      </div>

      <div className="cloud-container">
        <div className="cloud-blob cloud-1"></div>
        <div className="cloud-blob cloud-2"></div>
        <div className="cloud-blob cloud-3"></div>
        <div className="cloud-blob cloud-4"></div>
        <div className="cloud-blob cloud-5"></div>
        <div className="cloud-blob cloud-6"></div>
      </div>

      <motion.div 
        className="feature-detail-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        <Link to="/" className="back-button">← Back to Platform Features</Link>
        
        <h1 className="feature-detail-title">{feature.title}</h1>
        <p className="feature-detail-intro">{feature.intro}</p>

        <div className="feature-detail-list">
          <h2 className="feature-list-title">Features</h2>
          <ul className="feature-list">
            {feature.features.map((item, index) => (
              <li key={index} className="feature-list-item">{item}</li>
            ))}
          </ul>
        </div>
      </motion.div>
      <Footer />
    </motion.div>
  )
}

