import { Row, Col, Modal ,Button} from "react-bootstrap";
import { useState } from "react";
import { toast } from "react-toastify";

import useCart from "../cart/cartHook";

import DesktopCartTable from "../ResponsiveUI/DesktopCartTable";
import MobileCartCard from "../ResponsiveUI/MobileCartCard";
import OrderSummary from "../ResponsiveUI/OrderSummary";

function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleRemoveClick = (item) => {
    setSelectedItem(item);
    setShowRemoveModal(true);
  };

  const confirmRemove = () => {
    if (!selectedItem) return;

    removeFromCart(selectedItem.product_id);

    toast.success(
      `${selectedItem.name} has been removed from your cart.`
    );

    setShowRemoveModal(false);
    setSelectedItem(null);
  };

  const cancelRemove = () => {
    setShowRemoveModal(false);
    setSelectedItem(null);
  };

  const totalCost = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  return (
    <div className="container py-5" style={{ marginTop: "80px" }}>

      {/* Page Title */}

{/* Page Title */}

    <div className="text-center mb-5">

      <h2 className="fw-bold">
        Shopping Cart
      </h2>

      <p className="text-muted">
        {cartItems.length === 0
          ? "Your cart is empty."
          : "Review your selected artworks before checkout."}
      </p>

    </div>

      {/* Empty Cart */}

      {cartItems.length === 0 ? (

        <div
          className="text-center py-5"
          style={{
            minHeight: "50vh",
          }}
        >

          <div
            className="text-center py-5"
            style={{ minHeight: "15vh" }}
          >
            <i
              className="bi bi-cart-x"
              style={{
                fontSize: "4rem",
                color: "#adb5bd",
              }}
            ></i>

              <h4 className="mt-4 fw-semibold">
                Start exploring our collection
              </h4>

              <p className="text-muted">
                Your favorite artworks are waiting for you.
              </p>

              <Button
                variant="dark"
                href="/"
                className="mt-3 px-4"
              >
                Continue Exploring
              </Button>
            </div>

        </div>

      ) : (

        <Row className="g-5">

          {/* Products */}

          <Col lg={8}>

            {/* Desktop */}

            <div className="d-none d-md-block">

              <DesktopCartTable
                cart={cartItems}
                updateQuantity={updateQuantity}
                handleRemoveClick={handleRemoveClick}
              />

            </div>

            {/* Mobile */}

            <div className="d-block d-md-none">

              {cartItems.map((item) => (

                <MobileCartCard
                  key={item.product_id}
                  item={item}
                  updateQuantity={updateQuantity}
                  handleRemoveClick={handleRemoveClick}
                />

              ))}

            </div>

          </Col>

          {/* Order Summary */}

          <Col lg={4}>
            <OrderSummary totalCost={totalCost} />    
          </Col>

        </Row>

      )}

      {/* Remove Item Modal */}

      <Modal
        show={showRemoveModal}
        onHide={cancelRemove}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Remove Item
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          Are you sure you want to remove{" "}
          <strong>
            {selectedItem?.name}
          </strong>{" "}
          from your cart?

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="outline-secondary"
            onClick={cancelRemove}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={confirmRemove}
          >
            Remove
          </Button>

        </Modal.Footer>

      </Modal>

    </div>
  );
}

export default CartPage;