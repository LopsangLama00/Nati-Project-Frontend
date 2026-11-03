
import React, { useState } from "react";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { Link, useNavigate , useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { toast } from "react-toastify";

import Api from "../AxiosRequest/ApiConfig"; 
import useAuth from "../auth/AuthHook";

export default function LoginFunction() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  // ----------------------------------------------------------
  // Handle input changes
  // ----------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLoginDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ----------------------------------------------------------
  // Validate form
  // ----------------------------------------------------------

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    if (!loginDetails.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!loginDetails.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return !newErrors.email && !newErrors.password;
  };

  // ----------------------------------------------------------
  // Handle login
  // ----------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!validateForm()) return;

    setLoading(true);

    try {
      // The Axios request interceptor automatically:
      // 1. Checks for csrftoken.
      // 2. Calls /csrf/ if missing.
      // 3. Attaches X-CSRFToken.
      // 4. Sends login credentials with cookies.

      const response = await Api.post(
        "/auth/login/",
        loginDetails
      );

      // Verify backend response.
      if (!response.data?.user) {
        throw new Error(
          "Login response does not contain user information."
        );
      }
      
      // Update authentication context.
      await login(response.data.user);

      toast.success("Login successful!");

      // Retrieve the page the user originally wanted to visit.
      const redirectTo =
        location.state?.from?.pathname ||
        location.state?.from ||
        "/";

      // Only allow internal application paths.
      const safeRedirect =
        typeof redirectTo === "string" &&
        redirectTo.startsWith("/") &&
        !redirectTo.startsWith("//")
          ? redirectTo
          : "/";

      // Redirect to the originally requested page.
      navigate(safeRedirect, { replace: true });
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error.message
      );

      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 400 || status === 401) {
        toast.error(
          detail || "Email or password is incorrect."
        );

      } else if (status === 403) {
        toast.error(
          detail || "Security verification failed. Please reload and try again."
        );

      } else if (status === 429) {
        toast.error(
          "Too many login attempts. Please try again later."
        );

      } else if (status >= 500) {
        toast.error(
          "Server error. Please try again later."
        );

      } else if (!error.response) {
        toast.error(
          "Unable to connect to the server. Check your connection."
        );

      } else {
        toast.error(
          detail || "Login failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <div
      className="container d-flex justify-content-center"
      style={{ marginTop: "110px" }}
    >
      <div className="row w-100 justify-content-center">

        <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5 shadow p-4 border rounded bg-white">

          <h4 className="text-center fw-bold mt-4">
            Login Page
          </h4>

          <Form onSubmit={handleSubmit} noValidate>

            {/* Email */}

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>

              <Form.Control
                type="email"
                placeholder="abc@email.com"
                name="email"
                onChange={handleChange}
                value={loginDetails.email}
                isInvalid={!!errors.email}
                autoComplete="email"
              />

              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password */}

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>

              <div className="position-relative">

                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  onChange={handleChange}
                  value={loginDetails.password}
                  isInvalid={!!errors.password}
                  autoComplete="current-password"
                />

                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-3"
                  style={{
                    cursor: "pointer",
                    zIndex: 5,
                  }}
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </span>

              </div>

              {errors.password && (
                <div className="text-danger small mt-1">
                  {errors.password}
                </div>
              )}
            </Form.Group>

            {/* Submit */}

            <div className="d-flex justify-content-center">

              <Button
                variant="outline-primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

            </div>

          </Form>

          <div className="text-center mt-3">
            <span>
              Don't have an account?{" "}
              <Link to="/register">
                Click here
              </Link>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
