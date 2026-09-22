import { useEffect, useState, useRef } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import CloudBackground from '../../components/portal/CloudBackground'
import ThemeToggle from '../../components/portal/ThemeToggle'
import './ClientPortalLayout.css'

interface NavItem {
  label: string
  path: string
  icon?: string
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    label: 'Client Home',
    path: '/client-portal/home',
    children: [
      { label: 'Completed Orders', path: '/client-portal/home?tab=completed' },
      { label: 'Pending Orders', path: '/client-portal/home?tab=pending' },
      { label: 'Draft Orders', path: '/client-portal/home?tab=draft' },
      { label: 'Active Invitations', path: '/client-portal/home?tab=invitations' },
      { label: 'Rapid Invitation', path: '/client-portal/home?tab=rapid' },
    ]
  },
  {
    label: 'Order',
    path: '/client-portal/orders',
    children: [
      { label: 'Manual Order Entry', path: '/client-portal/orders/manual-entry' },
      { label: 'Order w/ Invitation', path: '/client-portal/orders/invite-order' },
    ]
  },
  {
    label: 'Reports & Orders',
    path: '/client-portal/reports',
    children: [
      { label: 'All Order Details', path: '/client-portal/reports/all-orders' },
      { label: 'Orders List', path: '/client-portal/reports/orders-list' },
      { label: 'Draft Order List', path: '/client-portal/reports/draft-orders' },
      { label: 'Order Summary Report', path: '/client-portal/reports/summary-report' },
      { label: 'Electronic Consents', path: '/client-portal/reports/consents' },
      { label: 'Adverse Worksheets', path: '/client-portal/reports/worksheets' },
      { label: 'Adverse Actions Log', path: '/client-portal/reports/adverse-actions' },
      { label: 'Analytics', path: '/client-portal/reports/analytics' },
      { label: 'HR Integrations', path: '/client-portal/reports/integrations' },
    ]
  },
  {
    label: 'Applicants',
    path: '/client-portal/applicants',
    children: [
      { label: 'Applicant Manager', path: '/client-portal/applicants/list' },
      { label: 'Applicant Invite Templates', path: '/client-portal/applicants/templates' },
      { label: 'Applicant Statistics', path: '/client-portal/applicants/statistics' },
    ]
  },
  {
    label: 'Drug Screening',
    path: '/client-portal/drug-screening',
    children: [
      { label: 'Drug Screening Dashboard', path: '/client-portal/drug-screening' },
      { label: 'Clinic Locator Map', path: '/client-portal/drug-screening/locator' },
      { label: 'Results Inbox', path: '/client-portal/drug-screening/results' },
    ]
  },
  {
    label: 'Invoices',
    path: '/client-portal/invoices',
    children: [
      { label: 'Invoice List', path: '/client-portal/invoices' },
      { label: 'Payment', path: '/client-portal/invoices/pay' },
      { label: 'Invoice History', path: '/client-portal/invoices/history' },
      { label: 'Billing Contact Info', path: '/client-portal/invoices/billing-info' },
    ]
  },
  {
    label: 'Account Settings',
    path: '/client-portal/settings',
    children: [
      { label: 'Manage Account', path: '/client-portal/settings/company' },
      { label: 'Manage Users', path: '/client-portal/settings/users' },
      { label: 'Manage Branches', path: '/client-portal/settings/branches' },
      { label: 'Notifications', path: '/client-portal/settings/notifications' },
    ]
  },
  {
    label: 'Support Center',
    path: '/client-portal/support',
    children: [
      { label: 'Bulk Order Requests', path: '/client-portal/support/bulk-orders' },
      { label: 'Forms & Documents', path: '/client-portal/support/forms' },
      { label: 'Email Activity Log', path: '/client-portal/support/email-log' },
    ]
  },
]

export default function ClientPortalLayout() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login')
        return
      }

      if (!user?.roles.includes('client_admin')) {
        navigate('/login')
        return
      }
    }
  }, [isAuthenticated, isLoading, user, navigate])

  // Auto-expand sections based on current route
  useEffect(() => {
    const currentPath = location.pathname
    const newExpanded = new Set(expandedSections)
    
    navItems.forEach(item => {
      if (item.children) {
        const isActive = item.children.some(child => currentPath === child.path) || currentPath === item.path
        if (isActive) {
          newExpanded.add(item.label)
        }
      }
    })
    
    setExpandedSections(newExpanded)
  }, [location.pathname])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  const toggleSection = (label: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedSections(newExpanded)
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  if (isLoading) {
    return (
      <div className="client-portal-loading">
        <div>Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.roles.includes('client_admin')) {
    return null
  }

  return (
    <div className="client-portal-wrapper">
      <CloudBackground />
      
      {/* Top Bar */}
      <header className="portal-top-bar">
        <div className="portal-top-left">
          <Link to="/client-portal/home" className="portal-logo">
            <img src="/logo3.png" alt="EvalRight" className="logo-image" />
          </Link>
        </div>
        <div className="portal-top-right">
          <div className="portal-search">
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <ThemeToggle />
          <div className="portal-profile-menu" ref={profileMenuRef}>
            <button
              className="profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="profile-name">{user.name}</span>
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to="/client-portal/settings" className="dropdown-item" onClick={() => setShowProfileMenu(false)}>Settings</Link>
                <button className="dropdown-item" onClick={() => { setShowProfileMenu(false); logout(); }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="portal-main-container">
        {/* Sidebar */}
        <aside className="portal-sidebar">
          <nav className="portal-nav">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedSections.has(item.label)
              const isActive = isActiveRoute(item.path)

              return (
                <div key={item.label} className="nav-section">
                  <Link
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      if (hasChildren) {
                        e.preventDefault()
                        toggleSection(item.label)
                      }
                    }}
                  >
                    <span className="nav-label">{item.label}</span>
                    {hasChildren && (
                      <span className={`nav-arrow ${isExpanded ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    )}
                  </Link>
                  {hasChildren && isExpanded && (
                    <div className="nav-children">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`nav-child ${isActiveRoute(child.path) ? 'active' : ''}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="portal-content">
          <div className="portal-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
