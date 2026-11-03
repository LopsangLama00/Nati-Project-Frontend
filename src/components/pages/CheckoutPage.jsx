import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { ApiService } from "../AxiosRequest/ApiConfig";
import useCart from "../cart/cartHook";
import useAuth from "../auth/AuthHook";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const { cartItems, clearCart } = useCart();
  const { isAuthenticated, authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    delivery_address: "",
    delivery_city: "",
    delivery_state: "",
    delivery_country: "Nepal",
    delivery_postal_code: "",
    delivery_phone: "",
    delivery_instructions: "",
    payment_method: "cash_on_delivery",
  });

  /*
   * Keep one idempotency key for this checkout session.
   *
   * If the request fails because of a temporary network problem,
   * submitting again uses the same key instead of creating a
   * completely different order request.
   */
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  // ============================================================
  // AUTHENTICATION / CART PROTECTION
  // ============================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: {
          from: "/checkout",
        },
      });

      return;
    }

    if (!cartItems || cartItems.length === 0) {
      navigate("/Cart", {
        replace: true,
      });
    }
  }, [
    authLoading,
    isAuthenticated,
    cartItems,
    navigate,
  ]);

  // ============================================================
  // DISPLAY-ONLY TOTALS
  // ============================================================

  const displaySubtotal = useMemo(() => {
    return (cartItems || []).reduce((total, item) => {
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 0);

      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  const displayShipping = 0;
  const displayTax = 0;

  const displayGrandTotal =
    displaySubtotal +
    displayShipping +
    displayTax;

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    const requiredFields = [
      ["delivery_address", "Delivery address"],
      ["delivery_city", "City"],
      ["delivery_country", "Country"],
      ["delivery_postal_code", "Postal code"],
      ["delivery_phone", "Phone number"],
    ];

    for (const [field, label] of requiredFields) {
      if (!formData[field]?.trim()) {
        toast.error(`${label} is required.`);
        return false;
      }
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return false;
    }

    return true;
  };

  // ============================================================
  // BUILD ORDER ITEMS
  // ============================================================

  const buildOrderItems = () => {
    return cartItems.map((item) => {
      const productId = item.product_id ?? item.id;
      const quantity = Number(item.quantity);

      return {
        product_id: Number(productId),
        quantity,
      };
    });
  };

  // ============================================================
  // SUBMIT ORDER
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const orderItems = buildOrderItems();

      // --------------------------------------------------------
      // Validate product IDs and quantities
      // --------------------------------------------------------

      for (const item of orderItems) {
        if (
          !Number.isInteger(item.product_id) ||
          item.product_id <= 0
        ) {
          toast.error("Invalid product in your cart.");
          return;
        }

        if (
          !Number.isInteger(item.quantity) ||
          item.quantity < 1
        ) {
          toast.error("Invalid product quantity.");
          return;
        }
      }

      // --------------------------------------------------------
      // SERVER-AUTHORITATIVE PAYLOAD
      // --------------------------------------------------------

      const payload = {
        idempotency_key: idempotencyKey,

        order_items: orderItems,

        delivery_address:
          formData.delivery_address.trim(),

        delivery_city:
          formData.delivery_city.trim(),

        delivery_state:
          formData.delivery_state.trim(),

        delivery_country:
          formData.delivery_country.trim(),

        delivery_postal_code:
          formData.delivery_postal_code.trim(),

        delivery_phone:
          formData.delivery_phone.trim(),

        delivery_instructions:
          formData.delivery_instructions.trim(),

        payment_method:
          formData.payment_method,
      };

      console.log(
        "Submitting order:",
        payload
      );

      // --------------------------------------------------------
      // IMPORTANT:
      //
      // ApiService uses Axios with:
      //
      // withCredentials: true
      //
      // Therefore HttpOnly cookies are automatically sent.
      // --------------------------------------------------------

      const response =
        await ApiService.orders.create(payload);

      console.log(
        "Order created:",
        response.data
      );

      // --------------------------------------------------------
      // Get order ID
      // --------------------------------------------------------

      const orderId =
        response.data?.id ??
        response.data?.order_id;

      // --------------------------------------------------------
      // Clear cart ONLY after successful order
      // --------------------------------------------------------

      clearCart();

      toast.success(
        "Order placed successfully!"
      );

      // --------------------------------------------------------
      // Navigate
      // --------------------------------------------------------

      if (orderId) {
        navigate(`/orders/${orderId}`, {
          replace: true,
        });
      } else {
        navigate("/orders", {
          replace: true,
        });
      }

    } catch (error) {
      console.error(
        "Order creation failed:",
        error.response?.data || error
      );

      const data = error.response?.data;

      // --------------------------------------------------------
      // DRF validation errors
      // --------------------------------------------------------

      if (
        data &&
        typeof data === "object" &&
        !data.detail
      ) {
        Object.entries(data).forEach(
          ([field, errors]) => {
            const message = Array.isArray(errors)
              ? errors.join(", ")
              : String(errors);

            toast.error(
              `${field}: ${message}`
            );
          }
        );

        return;
      }

      // --------------------------------------------------------
      // DRF detail error
      // --------------------------------------------------------

      if (data?.detail) {
        toast.error(data.detail);
        return;
      }

      // --------------------------------------------------------
      // Network / unknown error
      // --------------------------------------------------------

      toast.error(
        error.message ||
        "Unable to create your order."
      );

    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (authLoading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="mt-3">
          Checking your account...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="container py-5 mt-5">

      <div className="row g-5">

        {/* ====================================================
            CHECKOUT FORM
        ==================================================== */}

        <div className="col-lg-7">

          <div className="checkout-card">

            <div className="mb-4">
              <h1 className="checkout-title">
                Checkout
              </h1>

              <p className="text-muted mb-0">
                Enter your delivery information
                to complete your order.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <h5 className="checkout-section-title">
                Delivery Information
              </h5>

              {/* ADDRESS */}

              <div className="mb-3">
                <label
                  htmlFor="delivery_address"
                  className="form-label"
                >
                  Delivery Address
                </label>

                <textarea
                  id="delivery_address"
                  name="delivery_address"
                  className="form-control"
                  rows="3"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  placeholder="Enter your full delivery address"
                  required
                />
              </div>

              {/* CITY / STATE */}

              <div className="row">

                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="delivery_city"
                    className="form-label"
                  >
                    City
                  </label>

                  <input
                    id="delivery_city"
                    name="delivery_city"
                    type="text"
                    className="form-control"
                    value={formData.delivery_city}
                    onChange={handleChange}
                    placeholder="Kathmandu"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="delivery_state"
                    className="form-label"
                  >
                    State / Province
                  </label>

                  <input
                    id="delivery_state"
                    name="delivery_state"
                    type="text"
                    className="form-control"
                    value={formData.delivery_state}
                    onChange={handleChange}
                    placeholder="Bagmati"
                  />
                </div>

              </div>

              {/* COUNTRY / POSTAL */}

              <div className="row">

                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="delivery_country"
                    className="form-label"
                  >
                    Country
                  </label>

                  <input
                    id="delivery_country"
                    name="delivery_country"
                    type="text"
                    className="form-control"
                    value={formData.delivery_country}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label
                    htmlFor="delivery_postal_code"
                    className="form-label"
                  >
                    Postal Code
                  </label>

                  <input
                    id="delivery_postal_code"
                    name="delivery_postal_code"
                    type="text"
                    className="form-control"
                    value={formData.delivery_postal_code}
                    onChange={handleChange}
                    placeholder="44600"
                    required
                  />
                </div>

              </div>

              {/* PHONE */}

              <div className="mb-3">
                <label
                  htmlFor="delivery_phone"
                  className="form-label"
                >
                  Phone Number
                </label>

                <input
                  id="delivery_phone"
                  name="delivery_phone"
                  type="tel"
                  className="form-control"
                  value={formData.delivery_phone}
                  onChange={handleChange}
                  placeholder="98XXXXXXXX"
                  required
                />
              </div>

              {/* INSTRUCTIONS */}

              <div className="mb-4">
                <label
                  htmlFor="delivery_instructions"
                  className="form-label"
                >
                  Delivery Instructions
                  <span className="text-muted ms-1">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="delivery_instructions"
                  name="delivery_instructions"
                  className="form-control"
                  rows="3"
                  value={formData.delivery_instructions}
                  onChange={handleChange}
                  placeholder="Any special delivery instructions?"
                />
              </div>

              {/* PAYMENT */}

              <h5 className="checkout-section-title">
                Payment Method
              </h5>

              <div className="payment-option mb-4">

                <div className="form-check">

                  <input
                    id="cash_on_delivery"
                    name="payment_method"
                    type="radio"
                    className="form-check-input"
                    value="cash_on_delivery"
                    checked={
                      formData.payment_method ===
                      "cash_on_delivery"
                    }
                    onChange={handleChange}
                  />

                  <label
                    htmlFor="cash_on_delivery"
                    className="form-check-label"
                  >
                    <strong>
                      Cash on Delivery
                    </strong>

                    <div className="text-muted small">
                      Pay when your artwork is
                      delivered.
                    </div>
                  </label>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="btn btn-dark w-100 checkout-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />

                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="text-muted small text-center mt-3 mb-0">
                Final price and stock availability
                are verified securely by our server.
              </p>

            </form>

          </div>

        </div>

        {/* ====================================================
            ORDER SUMMARY
        ==================================================== */}

        <div className="col-lg-5">

          <div className="checkout-summary">

            <h4 className="mb-4">
              Your Order
            </h4>

            <div className="checkout-items">

              {cartItems.map((item, index) => {

                const productId =
                  item.product_id ?? item.id;

                const price =
                  Number(item.price || 0);

                const quantity =
                  Number(item.quantity || 0);

                return (
                  <div
                    key={
                      productId ||
                      `${item.name}-${index}`
                    }
                    className="checkout-item"
                  >

                    <div className="checkout-item-image">

                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name || item.title || "Product"}
                        />
                      ) : (
                        <div className="checkout-no-image">
                          No Image
                        </div>
                      )}

                    </div>

                    <div className="checkout-item-info">

                      <h6>
                        {item.name ||
                          item.title ||
                          "Artwork"}
                      </h6>

                      <p className="text-muted mb-0">
                        Qty: {quantity}
                      </p>

                    </div>

                    <div className="checkout-item-price">
                      Rs.{" "}
                      {(
                        price * quantity
                      ).toLocaleString()}
                    </div>

                  </div>
                );
              })}

            </div>

            <hr />

            <div className="summary-row">
              <span>Subtotal</span>

              <span>
                Rs.{" "}
                {displaySubtotal.toLocaleString()}
              </span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>

              <span>
                {displayShipping === 0
                  ? "Free"
                  : `Rs. ${displayShipping.toLocaleString()}`}
              </span>
            </div>

            <div className="summary-row">
              <span>Tax</span>

              <span>
                Rs.{" "}
                {displayTax.toLocaleString()}
              </span>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>

              <strong>
                Rs.{" "}
                {displayGrandTotal.toLocaleString()}
              </strong>
            </div>

            <div className="alert alert-light mt-4 small">

              <strong>
                Secure checkout
              </strong>

              <br />

              The prices shown above are for
              reference only. The server verifies
              the current product prices and stock
              before creating your order.

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}