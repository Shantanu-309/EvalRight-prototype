import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './navbar.css'

export default function Navbar() {
  const [isDark, setIsDark] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    } else {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const dropdownElement = dropdownRefs.current[openDropdown]
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName)
  }

  const dropdownMenus = {
    'what-we-do': [
      { label: 'Background Verification', href: '#' },
      { label: 'Identity Checks', href: '#' },
      { label: 'Document Verification', href: '#' }
    ],
    'bgv-india': [
      { label: 'Background Verification Services India', href: '/bgv-india' }
    ],
    'insights': [
      { label: 'Articles', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Reports', href: '#' }
    ]
  }

  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        {/* Left: Logo */}
        <Link to="/" className="navbar-logo">
          <img 
            src="/logo3.png" 
            alt="EvalRight" 
            className="navbar-logo-image"
          />
        </Link>

        {/* Center: Navigation Items */}
        <div className="navbar-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/discover-evalright" className="nav-link">Discover EvalRight</Link>
          
          <div 
            className="nav-dropdown-wrapper"
            ref={(el) => (dropdownRefs.current['what-we-do'] = el)}
          >
            <button 
              className="nav-link nav-link-dropdown"
              onClick={() => toggleDropdown('what-we-do')}
            >
              What We Do
              <span className={`dropdown-arrow ${openDropdown === 'what-we-do' ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {openDropdown === 'what-we-do' && (
              <div className="dropdown-menu">
                {dropdownMenus['what-we-do'].map((item, index) => (
                  <Link 
                    key={index} 
                    to={item.href} 
                    className="dropdown-item"
                    onClick={() => setOpenDropdown(null)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div 
            className="nav-dropdown-wrapper"
            ref={(el) => (dropdownRefs.current['bgv-india'] = el)}
          >
            <button 
              className="nav-link nav-link-dropdown"
              onClick={() => toggleDropdown('bgv-india')}
            >
              BGV India
              <span className={`dropdown-arrow ${openDropdown === 'bgv-india' ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {openDropdown === 'bgv-india' && (
              <div className="dropdown-menu">
                {dropdownMenus['bgv-india'].map((item, index) => (
                  <Link 
                    key={index} 
                    to={item.href} 
                    className="dropdown-item"
                    onClick={() => setOpenDropdown(null)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div 
            className="nav-dropdown-wrapper"
            ref={(el) => (dropdownRefs.current['insights'] = el)}
          >
            <button 
              className="nav-link nav-link-dropdown"
              onClick={() => toggleDropdown('insights')}
            >
              Insights
              <span className={`dropdown-arrow ${openDropdown === 'insights' ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {openDropdown === 'insights' && (
              <div className="dropdown-menu">
                {dropdownMenus['insights'].map((item, index) => (
                  <Link 
                    key={index} 
                    to={item.href} 
                    className="dropdown-item"
                    onClick={() => setOpenDropdown(null)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/contact" className="nav-link">Contact Us</Link>
        </div>

        {/* Right: Action Buttons */}
        <div className="navbar-right">
          <Link to="/login" className="navbar-btn navbar-btn-login">Login</Link>
          <Link to="/register" className="navbar-btn navbar-btn-register">Register</Link>
          <button 
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}




