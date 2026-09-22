import './reports.css'

export default function AllOrderDetails() {
  const orders = [
    { id: '#RC-1001', candidate: 'Michael Scott', date: 'Dec 01, 2025', package: 'Premium', status: 'COMPLETED' },
    { id: '#RC-1002', candidate: 'Jim Halpert', date: 'Dec 02, 2025', package: 'Standard', status: 'PROCESSING' },
  ]

  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">All Order Details</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>All Order Details</span>
        </div>
      </div>

      <div className="portal-card">
        <h2 className="section-title">Master Order History</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CANDIDATE NAME</th>
                <th>DATE</th>
                <th>PACKAGE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.candidate}</td>
                  <td>{order.date}</td>
                  <td>{order.package}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


















