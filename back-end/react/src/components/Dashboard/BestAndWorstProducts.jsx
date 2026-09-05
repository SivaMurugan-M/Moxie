import React from 'react'
import { AppIcon, ProductIcon, SparklesIcon, CancelCircleIcon } from '../../icons'

export default function BestAndWorstProducts({ bestAndWorst = {} }) {
  const bestSellers = bestAndWorst.best_sellers || []
  const lowestSellers = bestAndWorst.lowest_sellers || []

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '18px',
        alignItems: 'start',
        marginBottom: '18px'
      }}
    >
      {/* 1. Best Selling Products Card */}
      <div
        className="panel"
        style={{
          background: '#ffffff',
          border: '1px solid #e7ecf3',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 3px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          height: 'auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AppIcon icon={SparklesIcon} size={17} color="#10b981" />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Best Selling Products
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
              Top sales and high volume drivers
            </p>
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
            High Volume
          </span>
        </div>

        {/* Product Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {bestSellers.length > 0 ? (
            bestSellers.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                  boxSizing: 'border-box',
                  minHeight: '56px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f1f5f9'
                  e.currentTarget.style.background = '#f8fafc'
                }}
              >
                {/* Ranking */}
                <div style={{ width: '20px', fontSize: '12px', fontWeight: '800', color: '#6366f1', textAlign: 'center', flexShrink: 0 }}>
                  #{idx + 1}
                </div>

                {/* Product Image */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <AppIcon icon={ProductIcon} size={18} color="#6366f1" />
                  )}
                </div>

                {/* Info (Name, Category & Stock) */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '12.5px', color: '#0f172a', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2' }}>
                    {item.name}
                  </strong>
                  <small style={{ marginTop: '3px', fontSize: '11px', color: '#64748b', display: 'block', lineHeight: '1.2' }}>
                    {item.category} &middot; Stock: <b style={{ color: item.current_stock <= 10 ? '#f59e0b' : '#10b981' }}>{item.current_stock}</b>
                  </small>
                </div>

                {/* Metrics (Revenue & Units Sold) */}
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '95px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '12.5px', color: '#0f172a', fontWeight: '700', lineHeight: '1.2' }}>
                    ₹{Number(item.revenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                  <span style={{ marginTop: '3px', display: 'inline-block', fontSize: '11px', color: '#059669', fontWeight: '700', lineHeight: '1.2' }}>
                    {item.units_sold} sold
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>
              No sales recorded for this period.
            </div>
          )}
        </div>
      </div>

      {/* 2. Lowest Selling Products Card */}
      <div
        className="panel"
        style={{
          background: '#ffffff',
          border: '1px solid #e7ecf3',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 3px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          height: 'auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AppIcon icon={CancelCircleIcon} size={17} color="#f59e0b" />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Lowest Selling Products
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
              Slow-moving inventory items
            </p>
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#d97706', background: '#fffbeb', padding: '3px 8px', borderRadius: '6px' }}>
            Low Velocity
          </span>
        </div>

        {/* Product Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {lowestSellers.length > 0 ? (
            lowestSellers.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                  boxSizing: 'border-box',
                  minHeight: '56px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f1f5f9'
                  e.currentTarget.style.background = '#f8fafc'
                }}
              >
                {/* Product Image */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <AppIcon icon={ProductIcon} size={18} color="#94a3b8" />
                  )}
                </div>

                {/* Info (Name, Category & Stock) */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '12.5px', color: '#0f172a', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2' }}>
                    {item.name}
                  </strong>
                  <small style={{ marginTop: '3px', fontSize: '11px', color: '#64748b', display: 'block', lineHeight: '1.2' }}>
                    {item.category} &middot; Stock: <b style={{ color: item.current_stock <= 10 ? '#f59e0b' : '#10b981' }}>{item.current_stock}</b>
                  </small>
                </div>

                {/* Metrics (Units Sold & Demand Status) */}
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '95px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '700', lineHeight: '1.2' }}>
                    {item.units_sold} sold
                  </strong>
                  <span
                    style={{
                      marginTop: '3px',
                      display: 'inline-block',
                      fontSize: '10.5px',
                      fontWeight: '600',
                      color: item.demand_level === 'No Demand' ? '#94a3b8' : '#d97706',
                      lineHeight: '1.2'
                    }}
                  >
                    {item.demand_level}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>
              No slow-moving items recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
