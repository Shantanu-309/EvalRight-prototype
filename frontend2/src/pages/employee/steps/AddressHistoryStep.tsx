import { useState } from 'react'

interface Address {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
  fromDate: string
  toDate: string
  isCurrent: boolean
}

interface AddressHistoryStepProps {
  state: any
  onComplete: (data: any) => void
  onBack: () => void
  error: string | null
  setError: (error: string | null) => void
}

export default function AddressHistoryStep({ state, onComplete, onBack, error, setError }: AddressHistoryStepProps) {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      fromDate: '',
      toDate: '',
      isCurrent: true,
    }
  ])

  const addAddress = () => {
    setAddresses([...addresses, {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      fromDate: '',
      toDate: '',
      isCurrent: false,
    }])
  }

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index))
    }
  }

  const updateAddress = (index: number, field: keyof Address, value: any) => {
    const updated = [...addresses]
    updated[index] = { ...updated[index], [field]: value }
    if (field === 'isCurrent' && value === true) {
      updated[index].toDate = ''
    }
    setAddresses(updated)
  }

  const validateAddresses = (): boolean => {
    const sevenYearsAgo = new Date()
    sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7)
    
    let earliestDate = new Date()
    for (const addr of addresses) {
      if (!addr.fromDate) return false
      const fromDate = new Date(addr.fromDate)
      if (fromDate < earliestDate) earliestDate = fromDate
    }

    if (earliestDate > sevenYearsAgo) {
      setError('Address history must cover at least the last 7 years.')
      return false
    }

    // Check date continuity
    const sorted = [...addresses].sort((a, b) => 
      new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime()
    )

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i]
      const next = sorted[i + 1]
      const currentEnd = current.isCurrent ? new Date() : new Date(current.toDate)
      const nextStart = new Date(next.fromDate)
      
      const gapDays = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24)
      if (gapDays > 30) {
        setError('There are gaps in your address history. Please ensure dates are continuous.')
        return false
      }
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all addresses are filled
    for (const addr of addresses) {
      if (!addr.addressLine1 || !addr.city || !addr.state || !addr.zipCode || !addr.fromDate) {
        setError('Please fill in all required address fields.')
        return
      }
      if (!addr.isCurrent && !addr.toDate) {
        setError('Please provide an end date for previous addresses.')
        return
      }
    }

    if (!validateAddresses()) {
      return
    }

    onComplete({ addresses })
  }

  return (
    <div className="address-history-step">
      <h1>Address History</h1>
      <p>Please provide your address history for the last 7 years:</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="step-form">
        {addresses.map((address, index) => (
          <div key={index} className="address-block" style={{ 
            padding: '1.5rem', 
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '8px', 
            marginBottom: '1rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{address.isCurrent ? 'Current Address' : `Previous Address ${index}`}</h3>
              {addresses.length > 1 && (
                <button type="button" onClick={() => removeAddress(index)} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Remove
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Address Line 1 *</label>
              <input
                type="text"
                value={address.addressLine1}
                onChange={(e) => updateAddress(index, 'addressLine1', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                value={address.addressLine2}
                onChange={(e) => updateAddress(index, 'addressLine2', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => updateAddress(index, 'city', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => updateAddress(index, 'state', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>ZIP Code *</label>
                <input
                  type="text"
                  value={address.zipCode}
                  onChange={(e) => updateAddress(index, 'zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                  required
                  maxLength={5}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Country *</label>
              <input
                type="text"
                value={address.country}
                onChange={(e) => updateAddress(index, 'country', e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>From Date *</label>
                <input
                  type="date"
                  value={address.fromDate}
                  onChange={(e) => updateAddress(index, 'fromDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{address.isCurrent ? 'To Date (Leave empty if current)' : 'To Date *'}</label>
                <input
                  type="date"
                  value={address.toDate}
                  onChange={(e) => updateAddress(index, 'toDate', e.target.value)}
                  disabled={address.isCurrent}
                  required={!address.isCurrent}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={address.isCurrent}
                  onChange={(e) => updateAddress(index, 'isCurrent', e.target.checked)}
                />
                {' '}This is my current address
              </label>
            </div>
          </div>
        ))}

        <button type="button" onClick={addAddress} className="btn-secondary">
          + Add Previous Address
        </button>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button type="submit" className="btn-primary">
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}

