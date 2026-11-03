import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {ApiService} from '../AxiosRequest/ApiConfig';
import useAuth from '../auth/AuthHook';
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password1: '',
    new_password2: '',
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false); 
  const [logoutLoading, setLogoutLoading] = useState(false);


  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,    
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,

    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await ApiService.auth.updateProfile(profileData);
      
      // FIXED: Backend returns direct user data (no wrapper)
      login(res.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error( 
        "Profile update failed:", 
        error.response?.data || error.message 
      ); 
        
      const data = error.response?.data; 
      if (data?.detail) { 
        toast.error(data.detail); 
      } else if (data && typeof data === "object") { 
        const messages = Object.entries(data) 
          .map(([field, errors]) => { 
            const message = Array.isArray(errors) 
            ? errors.join(", ") 
            : errors; 
            
            return `${field}: ${message}`; 
          }) 
          .join("\n"); 
          
        toast.error(messages || "Failed to update profile."); 
      } else { 
        toast.error("Failed to update profile."); 
      } 
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password1 !== passwordData.new_password2) {
      toast.error("New passwords don't match");
      return;
    }

    setPasswordLoading(true);

    try {
      await ApiService.auth.changePassword( passwordData);
      
      toast.success('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password1: '',
        new_password2: '',
      });
    } catch (err) {
      const errors = err.response?.data;
      
      if (errors?.current_password) {
        toast.error(
          Array.isArray(errors.current_password) 
          ? errors.current_password[0] 
          : errors.current_password 
        );
      } else if (errors?.new_password1) {
        toast.error( 
          Array.isArray(errors.new_password1) 
          ? errors.new_password1[0] : 
          errors.new_password1 
        );
      } else if (errors?.new_password2) { 
        toast.error( 
          Array.isArray(errors.new_password2) 
          ? errors.new_password2[0] 
          : errors.new_password2 
        ); 
      } else if (errors?.detail) { 
        toast.error(errors.detail);
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Open confirmation modal 
  const handleLogoutClick = () => { 
    setShowLogoutModal(true); 

  };

  // Cancel logout 
  const handleCancelLogout = () => { 
    if (!logoutLoading) { 
      setShowLogoutModal(false); 
    } 
  }; 
  // Confirm logout 
  const handleConfirmLogout = async () => {
    setLogoutLoading(true);

    try {
      await logout();
      setShowLogoutModal(false);
      toast.success("You have been logged out successfully.");
      navigate("/login", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "Logout failed:",
        err.response?.data || err.message
      );

      toast.error(
        err.response?.data?.detail ||
        "Logout failed. Please try again."
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          My Profile
        </h2>

        <p className="text-muted mb-0">
          Manage your account information and security.
        </p>
      </div>

      <Row className="g-4">
        {/* Profile Information */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Profile Information</Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone_number"
                    value={profileData.phone_number}
                    onChange={handleProfileChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed
                  </Form.Text>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Password Change */}
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Change Password</Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="new_password1"
                    value={passwordData.new_password1}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="new_password2"
                    value={passwordData.new_password2}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Button
                  variant="warning"
                  type="submit"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Logout */}
      <div className="mt-5 pt-4 border-top">
        <div className="d-flex justify-content-between align-items-center">
          
          <div>
            <h5 className="fw-bold mb-1">
              Account
            </h5>

            <p className="text-muted mb-0">
              Sign out of your KHUMBULAYA account.
            </p>
          </div>

          <Button
            variant="outline-danger"
            onClick={handleLogoutClick}
            disabled={logoutLoading}
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </Button>

        </div>
      </div>

      
      <Modal
        show={showLogoutModal}
        onHide={handleCancelLogout}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to logout?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCancelLogout}
            disabled={logoutLoading}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleConfirmLogout}
            disabled={logoutLoading}
          >
            {logoutLoading ? "Logging out..." : "Logout"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}