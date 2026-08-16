import React from "react";

export default function MyOrders({ orders, onViewDetails, onTrackOrder, onCancelOrder }) {
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "placed": return "status-placed";
      case "confirmed": return "status-confirmed";
      case "packed": return "status-packed";
      case "shipped": return "status-shipped";
      case "out for delivery": return "status-out-for-delivery";
      case "delivered": return "status-delivered";
      case "cancelled": return "status-cancelled";
      default: return "";
    }
  };

  const handleReorder = (order) => {
    alert(`Reordered "${order.name}". Item details have been updated in your cart.`);
  };

  const handleReturnExchange = (order) => {
    alert(`Return request submitted for Order #${order.id}. Our logistics partner will contact you shortly.`);
  };

  if (!orders || orders.length === 0) {
    return (
      <div>
        <div className="panel-header">
          <h2>My Orders</h2>
        </div>
        <div className="text-center py-5">
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#2c3e50" }}>No Orders Placed Yet</h3>
          <p style={{ color: "#7f8c8d", fontSize: "14px" }}>You haven't placed any orders yet. Start exploring our collections!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="panel-header">
        <h2>My Orders</h2>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const isCancellable = ["placed", "confirmed", "packed"].includes(order.status.toLowerCase());
          const isReturnable = order.status.toLowerCase() === "delivered";

          return (
            <div key={order.id} className="order-item-card">
              <div className="order-card-header">
                <div className="order-id-block">
                  <h3>Order #{order.id}</h3>
                  <span className="order-date-text">Placed on: {order.date}</span>
                </div>
                <div>
                  <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-card-body">
                <img
                  src={order.image}
                  alt={order.name}
                  className="order-body-img"
                />
                <div className="order-body-info">
                  <h4 className="order-product-name">{order.name}</h4>
                  <p className="order-product-meta">{order.variant || "Standard Edition"}</p>
                  <p className="order-product-meta">Qty: {order.quantity} · Price: ₹{order.price.toLocaleString("en-IN")}</p>
                  <div className="order-total-amount">Total: ₹{order.total.toLocaleString("en-IN")}</div>
                </div>
              </div>

              <div className="order-card-actions">
                <button
                  className="secondary-btn btn-sm"
                  onClick={() => onViewDetails(order)}
                >
                  📄 View Details
                </button>
                
                {order.status.toLowerCase() !== "cancelled" && (
                  <button
                    className="secondary-btn btn-sm"
                    onClick={() => onTrackOrder(order)}
                  >
                    🚚 Track Order
                  </button>
                )}

                {isCancellable && (
                  <button
                    className="secondary-btn btn-sm text-danger"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
                        onCancelOrder(order.id);
                      }
                    }}
                  >
                    🛑 Cancel Order
                  </button>
                )}

                {isReturnable && (
                  <button
                    className="secondary-btn btn-sm"
                    onClick={() => handleReturnExchange(order)}
                  >
                    🔄 Return / Exchange
                  </button>
                )}

                <button
                  className="primary-btn btn-sm"
                  onClick={() => handleReorder(order)}
                >
                  🛒 Reorder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
