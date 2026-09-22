import '../ClientPortalHome.css'
import '../orders/orders.css'

export default function Payment() {
  return (
    <div className="portal-page">
      <div className="portal-page-header">
        <h1 className="portal-page-title">Payment</h1>
        <div className="portal-breadcrumbs">
          <span>Dashboard</span>
          <span>/</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="portal-card">
        <div className="card-header">
          <h2 className="card-title">Make a Payment</h2>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>CURRENT BALANCE</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#B30022', margin: 0 }}>$450.00</p>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>Pay with Card</h3>
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input type="text" id="cardNumber" placeholder="0000 0000 0000 0000" />
            </div>
            <button className="submit-button" style={{ width: '100%', marginTop: '1rem' }}>
              Pay $450.00
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


















