import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaYoutube,
} from "react-icons/fa";
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <Container>
        {/* TOP SECTION */}
        <Row className="gy-4">
          {/* BRAND */}
          <Col md={3}>
            <h6 className="footer-title">KHUMBULAYA GALLERY</h6>
            <p className="footer-text">
              Authentic hand-painted art from the Himalayan,
              crafted in Nepal.
            </p>
            <p className="footer-text">
              Namche Bazar, Solukhumbu, Nepal
            </p>
            <a
              href="mailto:imagesofKHUMBULAYA@gmail.com"
              className="footer-link"
            >
              imagesofKhumbulaya@gmail.com
            </a>
          </Col>

          {/* EXPLORE */}
          <Col md={3}>
            <h6 className="footer-title">EXPLORE</h6>
            <ul className="footer-list">
              <li><a href="#">Painting Collection</a></li>
              <li><a href="#">Original Painting</a></li>
              <li><a href="#">Painting Brocade</a></li>
              <li><a href="#">Commissioned Works</a></li>
            </ul>
          </Col>

          {/* LEARN */}
          <Col md={3}>
            <h6 className="footer-title">LEARN</h6>
            <ul className="footer-list">
              <li><a href="#">Blog</a></li>
              <li><a href="#">Painting Course</a></li>
              <li><a href="#">About Painting</a></li>
            </ul>
          </Col>

          {/* SUPPORT */}
          <Col md={3}>
            <h6 className="footer-title">SUPPORT</h6>
            <ul className="footer-list">
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Refund Policy</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </Col>
        </Row>

        <hr className="footer-divider" />

        {/* NEWSLETTER + SOCIAL */}
        <Row className="align-items-center gy-4">
          <Col md={6}>
            <p className="footer-subscribe-text">
              Join our circle for new Painting releases & teachings.
            </p>
            <Form className="d-flex gap-2">
              <Form.Control
                type="email"
                placeholder="Your email"
              />
              <Button className="footer-btn">Subscribe</Button>
            </Form>
          </Col>

          <Col
            md={6}
            className="d-flex justify-content-md-end align-items-center gap-3"
          >
            <span className="footer-text">Follow Us</span>
            <div className="footer-social">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaPinterestP /></a>
              <a href="#"><FaYoutube /></a>
            </div>
          </Col>
        </Row>

        <hr className="footer-divider" />

        {/* BOTTOM BAR */}
        <Row className="align-items-center gy-3">
          <Col md={6}>
            <p className="footer-copy">
              © 2026 KHUMBULAYA ART
            </p>
          </Col>

          {/* <Col
            md={6}
            className="d-flex justify-content-md-end gap-3"
          >
            <span className="footer-text">
              Secure payments • Worldwide shipping
            </span>
            <img src="/payments/visa.svg" alt="Visa" height="22" />
            <img src="/payments/mastercard.svg" alt="Mastercard" height="22" />
            <img src="/payments/paypal.svg" alt="PayPal" height="22" />
          </Col> */}
        </Row>
      </Container>
    </footer>
  );
}