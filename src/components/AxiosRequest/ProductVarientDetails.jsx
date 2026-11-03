
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiService } from "../AxiosRequest/ApiConfig";

import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import "../styles/ProductCardStyle.css";

export default function GetProductVarientDetail({ searchQuery = "" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      const query = searchQuery.trim();

      setLoading(true);
      setError("");

      try {
        let response;

        if (query) {
          // Search matching products
          response = await ApiService.products.search(query);
        } else {
          // Homepage: fetch all available products
          response = await ApiService.products.getAll();
        }

        if (isMounted) {
          const data = response.data;

          // Support both paginated and non-paginated responses
          const productList = Array.isArray(data)
            ? data
            : data.results || [];

          setProducts(productList);
        }

      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.detail ||
            err.message ||
            "Failed to load products."
          );
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };

  }, [searchQuery]);

  return (
    <div className="container py-4 mt-5">

      {loading && (
        <p className="text-center">Loading products...</p>
      )}

      {error && (
        <p className="text-danger text-center">{error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-center text-muted">
          {searchQuery.trim()
            ? `No products found for "${searchQuery}".`
            : "No products available at the moment."}
        </p>
      )}

      {!loading && products.length > 0 && (
        <Row className="g-4">

          {products.map((product) => (

            <Col key={product.id} xs={6} md={4} lg={3}>

              <Link
                to={`/product/${product.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >

                <Card className="gallery-card border-0 bg-transparent shadow-none">

                  <div className="gallery-image-wrapper">

                    <Card.Img
                      src={product.image_url}
                      alt={product.title}
                      className="gallery-image"
                    />

                    <div className="gallery-overlay">

                      <div className="gallery-content">

                        <h3 className="gallery-title">
                          {product.title}
                        </h3>

                        <div className="gallery-price text-warning">
                          Rs. {product.price}
                        </div>

                        <span className="gallery-size">
                          {product.size} inches
                        </span>

                      </div>

                    </div>

                  </div>

                </Card>

              </Link>

            </Col>

          ))}

        </Row>
      )}

    </div>
  );
}
