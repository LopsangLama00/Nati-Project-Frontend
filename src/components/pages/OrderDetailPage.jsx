import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, ListGroup, Badge, Button, Row, Col } from 'react-bootstrap';
import {ApiService} from '../AxiosRequest/ApiConfig';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  pending: 'secondary', confirmed: 'info', processing: 'primary',
  shipped: 'warning', delivered: 'success', cancelled: 'danger', refunded: 'dark'
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await ApiService.orders.getById(id);
        setOrder(res.data);
      } catch (error) {
        console.error(
          "Failed to fetch order:",
          error.response?.data || error.message
        );

        toast.error("Order not found");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  if (!order) return <div className="container py-5 text-center">Order not found</div>;

  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.order_status);

  return (
    <div className="container py-5 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Order #{order.order_id}</h2>
        <Badge bg={STATUS_COLORS[order.order_status] || 'secondary'} className="fs-6">
          {order.order_status}
        </Badge>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="fw-bold">Items</Card.Header>
            <ListGroup flush>
              {(order.product_details || []).map((item, idx) => (
                <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-medium">{item.product_title}</div>
                    <small className="text-muted">Qty: {item.quantity} × Rs. {Number(item.price).toFixed(2)}</small>
                  </div>
                  <div className="fw-medium">Rs. {(Number(item.price) * item.quantity).toFixed(2)}</div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {canCancel && (
            <Button
              variant="outline-danger"
              onClick={async () => {
                if (!window.confirm("Cancel this order?")) {
                  return;
                }

                try {
                  await ApiService.orders.cancel(order.id);

                  toast.success("Order cancelled successfully.");

                  setOrder((prev) => ({
                    ...prev,
                    order_status: "cancelled",
                  }));
                } catch (error) {
                  console.error(
                    "Order cancellation failed:",
                    error.response?.data || error.message
                  );

                  toast.error(
                    error.response?.data?.detail ||
                    "Failed to cancel order."
                  );
                }
              }}
            >
              Cancel Order
            </Button>
          )}
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '100px' }}>
            <Card.Header className="fw-bold">Order Summary</Card.Header>
            <Card.Body>
              <div className="mb-3"><strong>Subtotal:</strong> <span className="float-end">Rs. {Number(order.subtotal).toFixed(2)}</span></div>
              <div className="mb-3"><strong>Shipping:</strong> <span className="float-end">Rs. {Number(order.shipping_cost).toFixed(2)}</span></div>
              <div className="mb-3"><strong>Tax:</strong> <span className="float-end">Rs. {Number(order.tax_amount).toFixed(2)}</span></div>
              <hr />
              <div className="fw-bold fs-5"><strong>Total:</strong> <span className="float-end">Rs. {Number(order.grand_total).toFixed(2)}</span></div>
              <hr />
              <div className="mb-2"><strong>Payment:</strong> <Badge bg="info">{order.payment_status}</Badge></div>
              <div className="mb-2"><strong>Method:</strong> <span className="float-end">{order.payment_method.replace('_', ' ')}</span></div>
              {order.payment_transaction_id && <div className="mb-2"><strong>Txn ID:</strong> <span className="float-end">{order.payment_transaction_id}</span></div>}
              {order.shipping_tracking_number && <div className="mb-2"><strong>Tracking:</strong> <span className="float-end">{order.shipping_tracking_number}</span></div>}
            </Card.Body>
          </Card>

          <Card className="shadow-sm mt-3">
            <Card.Header className="fw-bold">Shipping Address</Card.Header>
            <Card.Body>
              <p className="mb-1">{order.delivery_address}</p>
              <p className="mb-1">{order.delivery_city}, {order.delivery_state} {order.delivery_postal_code}</p>
              <p className="mb-1">{order.delivery_country}</p>
              <p className="mb-0">Phone: {order.delivery_phone}</p>
              {order.delivery_instructions && <p className="text-muted small mt-2">{order.delivery_instructions}</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}