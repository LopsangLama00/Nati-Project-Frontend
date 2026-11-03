
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
} from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";

import { toast } from "react-toastify";

import { ApiService } from "../AxiosRequest/ApiConfig";

import useCart from "../cart/cartHook";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // Fetch Product Details
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        // Use centralized API service
        const response = await ApiService.products.getById(id);

        if (isMounted) {
          setProduct(response.data);
          setSelectedImage(response.data.image_url);
        }

      } catch (err) {
        if (isMounted) {
          console.error(
            "Failed to fetch product:",
            err.response?.data || err.message
          );

          setError(
            err.response?.data?.detail ||
            err.response?.data?.error ||
            "Unable to load product details."
          );
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
    };

  }, [id]);

  // ==========================================
  // Add to Cart
  // ==========================================

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, 1);

    toast.success(
      `${product.title} has been added to your cart.`
    );
  };

  // ==========================================
  // Buy Now
  // ==========================================

  const handleBuyNow = () => {
    if (!product) return;

    addToCart(product, 1);

    navigate("/checkout");
  };

  // ==========================================
  // Loading State
  // ==========================================

  if (loading) {
    return (
      <Container className="text-center py-5 mt-5">
        <div
          className="spinner-border text-warning"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="text-muted mt-3">
          Loading product details...
        </p>
      </Container>
    );
  }

  // ==========================================
  // Error State
  // ==========================================

  if (error) {
    return (
      <Container className="text-center py-5 mt-5">
        <p className="text-danger">
          {error}
        </p>

        <Button
          variant="outline-dark"
          onClick={() => navigate("/products")}
        >
          Browse Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return null;
  }

  // ==========================================
  // Product Detail UI
  // ==========================================

  return (
    <Container className="py-5 mt-5">

      <Row>

        {/* LEFT SIDE - PRODUCT IMAGES */}

        <Col md={6}>

          <Card className="border-0 shadow-sm">

            <Card.Img
              src={selectedImage || product.image_url}
              alt={product.title}
              style={{
                objectFit: "cover",
                height: "400px",
              }}
            />

          </Card>

          {/* Thumbnail Images */}

          <div className="d-flex mt-3 gap-2 flex-wrap">

            {/* Main Image */}

            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.title}
                width="80"
                height="80"
                style={{
                  objectFit: "cover",
                  cursor: "pointer",
                  border:
                    selectedImage === product.image_url
                      ? "2px solid orange"
                      : "1px solid #ddd",
                }}
                onClick={() =>
                  setSelectedImage(product.image_url)
                }
              />
            )}

            {/* Additional Images */}

            {product.images?.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={img.alt_text || product.title}
                width="80"
                height="80"
                style={{
                  objectFit: "cover",
                  cursor: "pointer",
                  border:
                    selectedImage === img.image_url
                      ? "2px solid orange"
                      : "1px solid #ddd",
                }}
                onClick={() =>
                  setSelectedImage(img.image_url)
                }
              />
            ))}

          </div>

        </Col>

        {/* RIGHT SIDE - PRODUCT DETAILS */}

        <Col md={6} className="mt-4 mt-md-0">

          <Card className="border-0 shadow-sm p-4">

            {/* Product Title */}

            <h2 className="fw-bold mb-3">
              {product.title}
            </h2>

            {/* Price */}

            <h3 className="text-warning mt-1 fw-bold mb-3">
              Rs. {product.price}
            </h3>

            {/* Size */}

            <p className="mb-2 mt-3">

              <strong>Size:</strong>

              <span
                className="px-3 py-2 border border-2 border-dark rounded fw-semibold bg-light"
                style={{
                  display: "inline-block",
                  marginLeft: 10,
                }}
              >
                {product.size} inches
              </span>

            </p>

            {/* Description */}

            <p
              className="mt-4 mb-4"
              style={{ lineHeight: "1.7" }}
            >

              <strong>Description:</strong>

              <br />

              <span className="text-muted">
                {product.description}
              </span>

            </p>

            {/* Action Buttons */}

            <div className="d-flex gap-3">

              <Button
                variant="dark"
                size="lg"
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                onClick={handleAddToCart}
              >

                <FontAwesomeIcon icon={faShoppingCart} />

                Add to Cart

              </Button>

              <Button
                variant="success"
                size="lg"
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2 fw-bold"
                onClick={handleBuyNow}
              >

                <FontAwesomeIcon icon={faBolt} />

                Buy Now

              </Button>

            </div>

          </Card>

        </Col>

      </Row>

    </Container>
  );
}
