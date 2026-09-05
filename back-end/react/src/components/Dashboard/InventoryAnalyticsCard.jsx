import React, { useEffect, useRef } from 'react'

export default function InventoryAnalyticsCard({ inventory = {} }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  const inStock = Number(inventory.in_stock || 0)
  const lowStock = Number(inventory.low_stock || 0)
  const outOfStock = Number(inventory.out_of_stock || 0)
  const totalProducts = Number(inventory.total_products || 0)

  useEffect(() => {
    if (!chartRef.current || !window.Chart) return
    const ctx = chartRef.current.getContext('2d')
    if (chartInstance.current) {
      chartInstance.current.destroy()
      chartInstance.current = null
    }

    if (totalProducts === 0) return

    chartInstance.current = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        datasets: [{
          data: [inStock, lowStock, outOfStock],
          backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
          hoverBackgroundColor: ['#059669', '#2563eb', '#dc2626'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            titleFont: { size: 11, weight: 'bold' },
            bodyFont: { size: 11 },
            padding: 8,
            cornerRadius: 6,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const val = context.parsed || 0
                const pct = totalProducts > 0 ? Math.round((val / totalProducts) * 100) : 0
                return ` ${context.label}: ${val} items (${pct}%)`
              }
            }
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [totalProducts, inStock, lowStock, outOfStock])

  return (
    <div
      className="panel dashboard-right-card inventory-analytics-card"
      style={{
        background: '#ffffff',
        border: '1px solid #e7ecf3',
        borderRadius: '16px',
        padding: '16px 18px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.03), 0 4px 12px rgba(15,23,42,0.04)',
        display: 'flex',
        flexDirection: 'column',
        height: '275px',
        minHeight: '275px',
        maxHeight: '275px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div className="card-header" style={{ marginBottom: '10px', flex: '0 0 auto' }}>
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.01em', lineHeight: '1.2' }}>
          Inventory Analytics & Health
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b', lineHeight: '1.2' }}>
          Live stock breakdown, fast-moving items, and inventory health
        </p>
      </div>

      {/* Main Content Area: Donut Chart on Left & Equal Status Cards on Right */}
      <div
        className="inventory-main-content"
        style={{
          display: 'grid',
          gridTemplateColumns: '86px 1fr',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '8px',
          flex: 1,
          minHeight: 0
        }}
      >
        {/* Donut Chart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          <div style={{ width: '84px', height: '84px', position: 'relative', flexShrink: 0, margin: '0 auto' }}>
            {totalProducts > 0 ? (
              <canvas ref={chartRef}></canvas>
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #f1f5f9' }}></div>
            )}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                lineHeight: '1.1'
              }}
            >
              <strong style={{ display: 'block', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {inventory.total_stock || 0}
              </strong>
              <span style={{ display: 'block', fontSize: '8.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px' }}>
                Units
              </span>
            </div>
          </div>
        </div>

        {/* Equal Status Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
          {/* In Stock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              height: '30px',
              background: '#f0fdf4',
              borderRadius: '7px',
              border: '1px solid #dcfce7',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#166534' }}>In Stock</span>
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#15803d' }}>
              {inStock} ({inventory.in_stock_pct || 0}%)
            </span>
          </div>

          {/* Low Stock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              height: '30px',
              background: '#eff6ff',
              borderRadius: '7px',
              border: '1px solid #dbeafe',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#1e40af' }}>Low Stock</span>
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#1d4ed8' }}>
              {lowStock} ({inventory.low_stock_pct || 0}%)
            </span>
          </div>

          {/* Out of Stock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              height: '30px',
              background: '#fef2f2',
              borderRadius: '7px',
              border: '1px solid #fee2e2',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#991b1b' }}>Out of Stock</span>
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#b91c1c' }}>
              {outOfStock} ({inventory.out_of_stock_pct || 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Fast / Slow Moving Summary Cards - Positioned cleanly at bottom */}
      <div
        className="inventory-footer"
        style={{
          marginTop: 'auto',
          paddingTop: '8px',
          borderTop: '1px solid #f1f5f9',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          flex: '0 0 auto'
        }}
      >
        <div
          style={{
            background: '#f8fafc',
            padding: '6px 10px',
            borderRadius: '7px',
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '1px'
          }}
        >
          <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: '500' }}>
            Fast Moving
          </span>
          <strong style={{ color: '#059669', fontSize: '11.5px', fontWeight: '700' }}>
            {(inventory.fast_moving_products || []).length} products
          </strong>
        </div>
        <div
          style={{
            background: '#f8fafc',
            padding: '6px 10px',
            borderRadius: '7px',
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '1px'
          }}
        >
          <span style={{ color: '#64748b', fontSize: '10px', display: 'block', fontWeight: '500' }}>
            Slow Moving
          </span>
          <strong style={{ color: '#d97706', fontSize: '11.5px', fontWeight: '700' }}>
            {(inventory.slow_moving_products || []).length} products
          </strong>
        </div>
      </div>
    </div>
  )
}
