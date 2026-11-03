import React from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";


function MobileCartCard({
  item,
  updateQuantity,
  handleRemoveClick,
}) {
  return (
    <Card
      className="shadow-sm border-0 rounded-4 mb-3"
      style={{
        overflow: "hidden",
      }}
    >
      <Card.Body className="p-3">

        {/* Image + Product Info */}

        <Row className="g-3 align-items-center">

          <Col xs={4}>

            <img
              src={item.image_url}
              alt={item.name}
              className="img-fluid rounded-3"
              style={{
                width: "100%",
                aspectRatio: "1/1",
                objectFit: "cover",
              }}
            />

          </Col>

          <Col xs={8}>

            <h5
              className="fw-semibold mb-2"
              style={{
                fontSize: "1.1rem",
              }}
            >
              {item.name}
            </h5>

            <p
              className="text-muted mb-1"
              style={{
                fontSize: ".95rem",
              }}
            >
              Price
            </p>

            <h6 className="fw-bold">
              Rs. {Number(item.price).toFixed(2)}
            </h6>

          </Col>

        </Row>

        {/* Quantity */}

        <div className="d-flex justify-content-center align-items-center my-4">

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
            className="mx-4 fw-bold"
            style={{
              fontSize: "1.15rem",
              minWidth: "20px",
              textAlign: "center",
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

        {/* Total */}

        <div className="d-flex justify-content-between align-items-center mb-3">

          <span
            className="text-muted"
            style={{
              fontSize: ".95rem",
            }}
          >
            Total
          </span>

          <h5 className="fw-bold mb-0">
            Rs. {(Number(item.price) * item.quantity).toFixed(2)}
          </h5>

        </div>

        {/* Remove */}

        <Button
          variant="outline-danger"
          className="w-100 rounded-3"
          onClick={() => handleRemoveClick(item)}
        >
          <FontAwesomeIcon
            icon={faTrash}
            className="me-2"
          />
          Remove Item
        </Button>

      </Card.Body>
    </Card>
  );
}

export default MobileCartCard;