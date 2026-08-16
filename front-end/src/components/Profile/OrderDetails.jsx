import React from "react";

export default function OrderDetails({ order, onBack }) {
  if (!order) return null;

  return (
    <div>
      <div className="panel-header">
        <div className="d-flex align-items-center gap-3">
          <button className="secondary-btn btn-sm py-1 px-2" onClick={onBack}>
            ← Back
          </button>
          <h2 style={{ fontSize: "20px" }}>Order #{order.id} Details</h2>
        </div>
      </div>

      {/* Product Information */}
      <div className="mb-4">
        <h4 className="mb-3" style={{ fontSize: "16px", fontWeight: "700", color: "#2c3e50" }}>Items Ordered</h4>
        <div className="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light">
          <div className="d-flex align-items-center gap-3">
            <img
              src={order.image}
              alt={order.name}
              style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "6px" }}
            />
            <div>
              <h5 className="m-0" style={{ fontSize: "14px", fontWeight: "700" }}>{order.name}</h5>
              <span className="text-muted" style={{ fontSize: "12px" }}>{order.variant || "Standard Edition"}</span>
            </div>
          </div>
          <div className="text-end">
            <div style={{ fontSize: "14px", fontWeight: "600" }}>₹{order.price.toLocaleString("en-IN")} x {order.quantity}</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#2c3e50" }}>₹{(order.price * order.quantity).toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Delivery Details */}
        <div className="col-md-6">
          <div className="p-3 border rounded-3 h-100">
            <h4 className="mb-3" style={{ fontSize: "15px", fontWeight: "700", color: "#2c3e50" }}>Shipping Address</h4>
            {order.shippingAddress ? (
              <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#2c3e50" }}>
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>{order.shippingAddress.name}</div>
                <div>{order.shippingAddress.flat}</div>
                <div>{order.shippingAddress.area}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
                <div className="mt-2 text-muted">Phone: {order.shippingAddress.phone}</div>
              </div>
            ) : (
              <p className="text-muted m-0" style={{ fontSize: "13px" }}>No shipping address registered.</p>
            )}
          </div>
        </div>

        {/* Shipping Status & Tracking Info */}
        <div className="col-md-6">
          <div className="p-3 border rounded-3 h-100">
            <h4 className="mb-3" style={{ fontSize: "15px", fontWeight: "700", color: "#2c3e50" }}>Delivery Information</h4>
            <div style={{ fontSize: "13px", lineHeight: "1.8", color: "#2c3e50" }}>
              <div><strong>Status:</strong> <span className="text-capitalize">{order.status}</span></div>
              <div><strong>Expected Delivery:</strong> {order.expectedDelivery}</div>
              {order.deliveryPartner && (
                <>
                  <div><strong>Delivery Partner:</strong> {order.deliveryPartner}</div>
                  <div><strong>Tracking Number:</strong> {order.trackingNumber}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Payment details */}
        <div className="col-md-6">
          <div className="p-3 border rounded-3 h-100">
            <h4 className="mb-3" style={{ fontSize: "15px", fontWeight: "700", color: "#2c3e50" }}>Payment Information</h4>
            <div style={{ fontSize: "13px", lineHeight: "1.8", color: "#2c3e50" }}>
              <div><strong>Method:</strong> {order.paymentMethod}</div>
              <div><strong>Status:</strong> {order.paymentStatus}</div>
              {order.transactionRef && (
                <div><strong>Transaction ID:</strong> {order.transactionRef}</div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing details */}
        <div className="col-md-6">
          <div className="p-3 border rounded-3 bg-light">
            <h4 className="mb-3" style={{ fontSize: "15px", fontWeight: "700", color: "#2c3e50" }}>Invoice Summary</h4>
            <div style={{ fontSize: "13px", lineHeight: "2" }}>
              <div className="d-flex justify-content-between">
                <span>Subtotal (MRP)</span>
                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="d-flex justify-content-between text-success">
                <span>Discount</span>
                <span>-₹{order.discount.toLocaleString("en-IN")}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Shipping Fee</span>
                <span>₹{order.shippingCharge.toLocaleString("en-IN")}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Estimated Tax (GST)</span>
                <span>₹{order.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 mt-2" style={{ fontSize: "15px", fontWeight: "700", color: "#2c3e50" }}>
                <span>Grand Total</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
