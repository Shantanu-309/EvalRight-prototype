import { useState, useEffect } from 'react'
import '../ClientPortalHome.css'
import '../reports/reports.css'
import api from '../../../services/api'

interface Invoice {
  id: number
  branch: string
  invoiceDate: string
  dueDate: string
  total: number
  status: 'paid' | 'pending' | 'overdue'
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await api.get('/api/invoices')
      // setInvoices(response.data)
      
      // Mock data for now
      setInvoices([])
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(inv => 
    inv.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.id.toString().includes(searchTerm)
  )

  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredInvoices.length / entriesPerPage)

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'paid': return 'status-paid'
      case 'pending': return 'status-pending'
      case 'overdue': return 'status-overdue'
      default: return ''
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">My Invoices</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Invoices</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="invoice-list-header">
          <div className="entries-selector">
            <label>
              Show{' '}
              <select 
                value={entriesPerPage} 
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="entries-select"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              {' '}entries per page
            </label>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="search-input"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Branch</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading...
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                    No invoices found
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.branch}</td>
                    <td>{formatDate(invoice.invoiceDate)}</td>
                    <td>{formatDate(invoice.dueDate)}</td>
                    <td>{formatCurrency(invoice.total)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button className="btn-download" onClick={() => {
                        // TODO: Implement download
                        console.log('Download invoice', invoice.id)
                      }}>
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="table-info">
            Showing {filteredInvoices.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} entries
          </div>
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              ««
            </button>
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              «
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              »
            </button>
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              »»
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}










