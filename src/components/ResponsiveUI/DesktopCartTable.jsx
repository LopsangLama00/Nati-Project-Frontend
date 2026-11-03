import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";


function DesktopCartTable({
  cart,
  updateQuantity,
  handleRemoveClick,
}) {
  return (
    <>
      {/* Table Header */}
      <Row className="fw-bold border-bottom pb-3 mb-4 align-items-center text-uppercase">
        <Col md={6}>Product</Col>
        <Col md={2} className="text-center">
          Price
        </Col>
        <Col md={2} className="text-center">
          Quantity
        </Col>
        {/* <Col md={1} className="text-center">
          Total
        </Col> */}
        <Col md={1}></Col>
      </Row>

      {/* Cart Items */}
      {cart.map((item) => (
        <Row
          key={item.product_id}
          className="align-items-center border-bottom py-4"
        >
          {/* Product */}
          <Col md={6}>
            <div className="d-flex align-items-center">

              <Card.Img
                src={item.image_url}
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "15px",
                  flexShrink: 0,
                }}
              />

              <div className="ms-4">
                <h4
                  className="fw-semibold mb-2"
                  style={{
                    fontSize: "1.35rem",
                  }}
                >
                  {item.name}
                </h4>

                <p
                  className="text-muted mb-0"
                  style={{
                    fontSize: ".95rem",
                  }}
                >
                  Beautiful Himalayan Artwork
                </p>
              </div>

            </div>
          </Col>

          {/* Price */}
          <Col md={2} className="text-center">
            <h5 className="fw-semibold mb-0">
              Rs. {Number(item.price).toFixed(2)}
            </h5>
          </Col>

          {/* Quantity */}
          <Col md={2}>
            <div className="d-flex justify-content-center align-items-center">

              <Button
                variant="outline-dark"
                size="sm"
                onClick={() =>
                  updateQuantity(
                    item.product_id,
                    Math.max(1, item.quantity - 1)
                  )
                }
              >
                <FontAwesomeIcon icon={faMinus} />
              </Button>

              <span
                className="mx-3 fw-bold"
                style={{
                  minWidth: "25px",
                  textAlign: "center",
                  fontSize: "1.1rem",
                }}
              >
                {item.quantity}
              </span>

              <Button
                variant="outline-dark"
                size="sm"
                onClick={() =>
                  updateQuantity(
                    item.product_id,
                    item.quantity + 1
                  )
                }
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>

            </div>
          </Col>

          {/* Total */}
          {/* <Col md={1} className="text-center">
            <h5 className="fw-bold mb-0">
              Rs. {(Number(item.price) * item.quantity).toFixed(2)}
            </h5>
          </Col> */}

          {/* Remove */}
          <Col md={1} className="text-center">

            <Button
              variant="outline-danger"
              onClick={() => handleRemoveClick(item)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>

          </Col>
        </Row>
      ))}
    </>
  );
}

export default DesktopCartTable;