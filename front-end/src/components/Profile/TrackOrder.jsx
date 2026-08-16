import React from "react";

export default function TrackOrder({ order, onBack }) {
  if (!order) return null;

  const steps = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
  
  const getStatusIndex = (status) => {
    switch (status.toLowerCase()) {
      case "placed": return 0;
      case "confirmed": return 1;
      case "packed": return 2;
      case "shipped": return 3;
      case "out for delivery": return 4;
      case "delivered": return 5;
      default: return -1;
    }
  };

  const currentStepIndex = getStatusIndex(order.status);
  const isCancelled = order.status.toLowerCase() === "cancelled";

  // Calculate timeline progress bar width
  const progressWidth = currentStepIndex >= 0 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : "0%";

  return (
    <div>
      <div className="panel-header">
        <div className="d-flex align-items-center gap-3">
          <button className="secondary-btn btn-sm py-1 px-2" onClick={onBack}>
            ← Back
          </button>
          <h2 style={{ fontSize: "20px" }}>Track Order #{order.id}</h2>
        </div>
      </div>

      {isCancelled ? (
        <div className="alert alert-danger p-4 rounded-3 text-center mb-4">
          <span style={{ fontSize: "36px" }}>🛑</span>
          <h3 className="mt-2" style={{ fontSize: "18px", fontWeight: "700" }}>This Order Has Been Cancelled</h3>
          <p className="m-0 text-muted" style={{ fontSize: "14px" }}>
            Cancelled on: {order.timeline?.cancelled || order.date}
          </p>
        </div>
      ) : (
        <div className="tracking-timeline-container mb-5 border rounded-3 p-4 bg-white">
          <div className="timeline-steps">
            <div className="timeline-progress-bar" style={{ width: progressWidth }}></div>
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              
              // Get timeline step time from order object
              const timeKey = step.toLowerCase().replace(" ", "");
              let stepTime = order.timeline ? order.timeline[timeKey === "outfordelivery" ? "outForDelivery" : timeKey] : null;

              // Fallback timestamps for testing progress changes
              if (idx === 0 && !stepTime) stepTime = `${order.date}, 10:00 AM`;
              if (idx === 1 && idx <= currentStepIndex && !stepTime) stepTime = `${order.date}, 02:00 PM`;

              return (
                <div
                  key={step}
                  className={`timeline-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                >
                  <div className="timeline-circle">
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span className="timeline-label">{step}</span>
                  {stepTime && <span className="timeline-step-time">{stepTime}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Meta grid information */}
      <div className="tracking-meta-grid">
        <div className="meta-col">
          <h4>Shipping Specifications</h4>
          <div className="meta-row">
            <span className="meta-label">Delivery Partner:</span>
            <span className="meta-val">{order.deliveryPartner || "Moxie Logistics"}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Tracking Number:</span>
            <span className="meta-val">{order.trackingNumber || "MX-T100293"}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Est. Delivery:</span>
            <span className="meta-val">{order.expectedDelivery}</span>
          </div>
        </div>

        <div className="meta-col">
          <h4>Delivery Address</h4>
          {order.shippingAddress ? (
            <div style={{ fontSize: "13px", color: "#2c3e50", lineHeight: "1.6" }}>
              <div style={{ fontWeight: "700" }}>{order.shippingAddress.name}</div>
              <div>{order.shippingAddress.flat}</div>
              <div>{order.shippingAddress.area}</div>
              <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
            </div>
          ) : (
            <span className="text-muted">No address provided.</span>
          )}
        </div>
      </div>
    </div>
  );
}
