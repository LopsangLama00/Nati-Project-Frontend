import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

function OrderSummary({
  totalCost,
  onCheckout,
  
})

 {
  const navigate = useNavigate();
  return (
    
    <Card
      className="border-0 shadow rounded-4"
      style={{
        position: "sticky",
        top: "100px",
      }}
    >
      <Card.Body className="p-4">

        <h3 className="fw-bold mb-4">
          Order Summary
        </h3>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted">
            Subtotal
          </span>

          <span className="fw-semibold">
            Rs. {totalCost.toFixed(2)}
          </span>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted">
            Shipping
          </span>

          <span className="text-success fw-semibold">
            Free
          </span>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted">
            VAT
          </span>

          <span className="fw-semibold">
            Included
          </span>
        </div>

        <hr />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">
           Total
          </h4>

          <h4 className="fw-bold mb-0">
            Rs. {totalCost.toFixed(2)}
          </h4>
        </div>

        <Button
          variant="dark"
          size="lg"
          className="w-100 rounded-3 py-3 fw-semibold"
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </Button>

        <p
          className="text-center text-muted mt-3 mb-0"
          style={{
            fontSize: ".9rem",
          }}
        >
          Secure checkout • Free shipping
        </p>

      </Card.Body>
    </Card>
  );
}

export default OrderSummary;