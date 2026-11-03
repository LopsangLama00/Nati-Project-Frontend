import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Spinner, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {ApiService} from '../AxiosRequest/ApiConfig';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try { 
        const response = await ApiService.orders.getMyOrders(); 
         const data = response.data; 
         
         setOrders( Array.isArray(data) ? data : data?.results || [] ); 
        } catch (error) { 
          console.error( 
            "Failed to load orders:", 
            error.response?.data || error.message 
          ); 
          toast.error( error.response?.data?.detail || "Failed to load your orders." ); 
        } 
        finally { 
          setLoading(false); 
        } 
      }; 
      
      fetchOrders();

  }, []);

  if (loading) {
    return (
      <div className="container py-5 mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
          </Spinner>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5">
      <h2 className="fw-bold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <Card className="text-center py-5 shadow-sm">
          <Card.Body>
            <p className="text-muted mb-3">You haven't placed any orders yet.</p>
            <Link to="/" className="btn btn-dark">Start Shopping</Link>
          </Card.Body>
        </Card>
      ) : (
        <Table striped hover responsive className="shadow-sm align-middle">
          <thead className="table-dark">
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.order_id}</td>
                <td>{new Date(order.ordered_at).toLocaleDateString()}</td>
                <td>                  
                  <span
                    className={`badge ${
                      order.order_status?.toLowerCase() ===
                      "delivered"
                        ? "bg-success"
                        : order.order_status?.toLowerCase() ===
                          "cancelled"
                        ? "bg-danger"
                        : "bg-secondary"
                    }`}
                  >
                    {order.order_status}
                  </span>
                </td>
                <td>  
                  <span
                    className={`badge ${
                      order.payment_status?.toLowerCase() === "paid"
                        ? "bg-success"
                        : order.payment_status?.toLowerCase() === "failed"
                        ? "bg-danger"
                        : "bg-secondary"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </td>
                <td className="fw-bold">Rs. {Number(order.grand_total).toFixed(2)}</td>
                <td>
                  <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-dark">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}