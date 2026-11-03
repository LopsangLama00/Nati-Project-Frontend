
import React, { useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import {
  ToastContainer,
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { useNavigate } from "react-router-dom";

import { ApiService } from "../AxiosRequest/ApiConfig";


function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password1: "",
    password2: "",
  });

  const [RegDetails, setRegDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password1: "",
    password2: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setRegDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for the field being edited
    setError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Validate registration form
  const validateForm = () => {
    const newErrors = {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password1: "",
      password2: "",
    };

    const values = {
      ...RegDetails,
      first_name: RegDetails.first_name.trim(),
      last_name: RegDetails.last_name.trim(),
      email: RegDetails.email.trim(),
      phone_number: RegDetails.phone_number.trim(),
    };

    if (!values.first_name) {
      newErrors.first_name = "First name is required";
    }

    if (!values.last_name) {
      newErrors.last_name = "Last name is required";
    }

    if (!values.email) {
      newErrors.email = "Email is required";
    }

    if (!values.phone_number) {
      newErrors.phone_number = "Phone number is required";
    }

    if (!values.password1) {
      newErrors.password1 = "Password is required";
    }

    if (!values.password2) {
      newErrors.password2 = "Confirm password is required";
    }

    if (
      values.password1 &&
      values.password2 &&
      values.password1 !== values.password2
    ) {
      newErrors.password2 = "Passwords do not match";
    }

    setError(newErrors);

    return !Object.values(newErrors).some((message) => message !== "");
  };

  // Submit registration form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Use centralized ApiService
      const response = await ApiService.auth.register(RegDetails);

      toast.success("Registration successful!");

      console.log("Registration response:", response.data);

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      console.error("Registration error:", err);

      const status = err.response?.status;
      const responseData = err.response?.data;

      if (status === 400) {
        // Handle Django REST Framework validation errors
        if (responseData && typeof responseData === "object") {
          const backendErrors = {};

          Object.keys(error).forEach((field) => {
            if (responseData[field]) {
              backendErrors[field] = Array.isArray(responseData[field])
                ? responseData[field][0]
                : responseData[field];
            }
          });

          if (Object.keys(backendErrors).length > 0) {
            setError((prev) => ({
              ...prev,
              ...backendErrors,
            }));
          } else {
            toast.error(
              responseData.detail ||
              responseData.message ||
              "Please check your registration details."
            );
          }
        } else {
          toast.error("Invalid registration details.");
        }

      } else if (status === 409) {
        toast.error("An account with these details already exists.");

      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");

      } else if (!err.response) {
        toast.error("Unable to connect to the server. Check your connection.");

      } else {
        toast.error(
          responseData?.detail ||
          responseData?.message ||
          "Registration failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container d-flex justify-content-center mt-5 pt-5">

        <div className="row w-100 justify-content-center">

          <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5">

            <div className="shadow p-4 rounded border bg-white">

              <ToastContainer />

              <h4 className="text-center fw-bold">
                User Registration
              </h4>

              <br />

              <Form onSubmit={handleSubmit} noValidate>

                {/* First Name */}
                <Form.Group className="mb-3" controlId="fName">
                  <Form.Label>First Name</Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="First Name"
                    name="first_name"
                    onChange={handleChange}
                    value={RegDetails.first_name}
                    isInvalid={!!error.first_name}
                  />

                  <Form.Control.Feedback type="invalid">
                    {error.first_name}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Last Name */}
                <Form.Group className="mb-3" controlId="lName">
                  <Form.Label>Last Name</Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="Last Name"
                    name="last_name"
                    onChange={handleChange}
                    value={RegDetails.last_name}
                    isInvalid={!!error.last_name}
                  />

                  <Form.Control.Feedback type="invalid">
                    {error.last_name}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3" controlId="UserEmail">
                  <Form.Label>Email</Form.Label>

                  <Form.Control
                    type="email"
                    placeholder="email@example.com"
                    name="email"
                    onChange={handleChange}
                    value={RegDetails.email}
                    isInvalid={!!error.email}
                  />

                  <Form.Control.Feedback type="invalid">
                    {error.email}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Phone Number */}
                <Form.Group className="mb-3" controlId="UserPhone">
                  <Form.Label>Phone Number</Form.Label>

                  <Form.Control
                    type="tel"
                    placeholder="98XXXXXXXX"
                    name="phone_number"
                    onChange={handleChange}
                    value={RegDetails.phone_number}
                    isInvalid={!!error.phone_number}
                  />

                  <Form.Control.Feedback type="invalid">
                    {error.phone_number}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3" controlId="Password">
                  <Form.Label>Password</Form.Label>

                  <div className="position-relative">

                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      name="password1"
                      onChange={handleChange}
                      value={RegDetails.password1}
                      isInvalid={!!error.password1}
                      className="pe-5"
                    />

                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3"
                      style={{ cursor: "pointer", zIndex: 5 }}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>

                  </div>

                  {error.password1 && (
                    <p className="text-danger small mt-1 mb-0">
                      {error.password1}
                    </p>
                  )}
                </Form.Group>

                {/* Confirm Password */}
                <Form.Group className="mb-3" controlId="ConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>

                  <div className="position-relative">

                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      name="password2"
                      onChange={handleChange}
                      value={RegDetails.password2}
                      isInvalid={!!error.password2}
                      className="pe-5"
                    />

                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3"
                      style={{ cursor: "pointer", zIndex: 5 }}
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>

                  </div>

                  {error.password2 && (
                    <p className="text-danger small mt-1 mb-0">
                      {error.password2}
                    </p>
                  )}
                </Form.Group>

                {/* Submit Button */}
                <div className="d-flex justify-content-center mt-3">

                  <Button
                    variant="outline-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register"}
                  </Button>

                </div>

              </Form>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
