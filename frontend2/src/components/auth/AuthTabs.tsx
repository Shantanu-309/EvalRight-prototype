import './auth-tabs.css'

interface AuthTabsProps {
  activeTab: 'business' | 'individual'
  onTabChange: (tab: 'business' | 'individual') => void
  tab1Label: string
  tab2Label: string
  variant?: 'red' | 'purple'
}

export default function AuthTabs({ activeTab, onTabChange, tab1Label, tab2Label, variant = 'red' }: AuthTabsProps) {
  return (
    <div className={`auth-tabs auth-tabs-${variant}`}>
      <button
        type="button"
        className={`auth-tab auth-tab-${variant} ${activeTab === 'business' ? 'active' : ''}`}
        onClick={() => onTabChange('business')}
        aria-label={tab1Label}
      >
        {tab1Label}
      </button>
      <button
        type="button"
        className={`auth-tab auth-tab-${variant} ${activeTab === 'individual' ? 'active' : ''}`}
        onClick={() => onTabChange('individual')}
        aria-label={tab2Label}
      >
        {tab2Label}
      </button>
    </div>
  )
}

