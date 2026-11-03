import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faMagnifyingGlass,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import useCart from "../cart/cartHook";
import useAuth from "../auth/AuthHook";
import { useNavigate } from 'react-router-dom';



function NavBar() {
  const [expanded, setExpanded] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const { cartItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );



  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const closeNavbar = () => {
  setExpanded(false);
};

  return (
    <>
    <Navbar
      expand="lg"
      fixed="top"
      expanded={expanded}
      className={`py-3 w-100 transition-all ${
        scrolled || expanded ? "bg-white shadow-sm" : "bg-transparent"
      }`}
      style={{ zIndex: 1000 }}
    >
      <Container fluid="lg">
        {/* BRAND */}
        <Navbar.Brand
          as={Link}
          to="/"
          onClick={closeNavbar}
          className="fw-bold fs-4 letter-spacing"
        >
          KHUMBULAYA
        </Navbar.Brand>

        {/* TOGGLE BUTTON */}
        <Navbar.Toggle
          aria-controls="navbarScroll"
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? (
            <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>
              &times;
            </span>
          ) : (
            <span className="navbar-toggler-icon"></span>
          )}
        </Navbar.Toggle>

        {/* COLLAPSIBLE CONTENT */}
        <Navbar.Collapse id="navbarScroll">
          {/* SEARCH */}
          <div className="mx-lg-auto my-3 my-lg-0 w-100 d-flex justify-content-center">
            <Form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }}>
              <Form.Control
                type="search"
                placeholder="Search products..."
                className="me-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form>
          </div>

          {/* RIGHT ACTIONS */}
          <Nav
            className="ms-lg-auto align-items-lg-center gap-3"
            onClick={closeNavbar}
          >
            <Nav.Link
              as={Link}
              to="/Cart"
              className="d-flex align-items-center gap-1"
            >
              <FontAwesomeIcon icon={faCartShopping} />
              <span className="fw-medium">Cart</span>
              <span className="badge bg-dark rounded-pill">
                {cartCount}
              </span>
            </Nav.Link>

            <Nav.Link
              as={Link}
              to={isAuthenticated ? "/profile" : "/login"}
              className="d-flex align-items-center gap-1"
            >
              <FontAwesomeIcon icon={faUser} />
              <span className="fw-medium">
                {isAuthenticated ? user.first_name : "Login"}
              </span>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </>
  );
}

export default NavBar;