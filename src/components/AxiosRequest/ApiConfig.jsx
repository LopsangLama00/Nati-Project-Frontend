import axios from "axios";
import { toast } from "react-toastify";

// ============================================================
// 1. Configuration
// ============================================================

export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_URL,

  API_PREFIX: "/api",
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// ============================================================
// 2. Axios instance
// ============================================================

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ============================================================
// 3. CSRF utilities
// ============================================================

export const getCookie = (name) => {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(
        cookie.substring(name.length + 1)
      )
    : null;
};

// Prevent multiple simultaneous CSRF initialization requests.
let csrfPromise = null;

export const ensureCsrfCookie = async () => {
  if (getCookie("csrftoken")) {
    return getCookie("csrftoken");
  }

  if (!csrfPromise) {
    csrfPromise = api
      .get("/csrf/")
      .then(() => {
        const token = getCookie("csrftoken");

        if (!token) {
          throw new Error(
            "CSRF cookie was not created by Django."
          );
        }

        return token;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

// ============================================================
// 4. Request interceptor
// ============================================================

const SAFE_METHODS = [
  "get",
  "head",
  "options",
  "trace",
];

api.interceptors.request.use(
  async (config) => {
    const method = (
      config.method || "get"
    ).toLowerCase();

    if (!SAFE_METHODS.includes(method)) {
      // Ensure CSRF cookie exists before unsafe requests.
      const csrfToken = await ensureCsrfCookie();

      config.headers = config.headers || {};

      // Django expects this header for CSRF validation.
      config.headers["X-CSRFToken"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// 5. Refresh management
// ============================================================

// Prevent multiple simultaneous refresh requests.
let refreshPromise = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post(
        "/token/refresh/",
        {},
        {
          _skipAuthRefresh: true,
        }
      )
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// ============================================================
// 6. Response interceptor
// ============================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // --------------------------------------------------------
    // Network errors
    // --------------------------------------------------------

    if (!error.response) {
      if (
        originalRequest &&
        (originalRequest._retryCount || 0) <
          API_CONFIG.MAX_RETRIES
      ) {
        originalRequest._retryCount =
          (originalRequest._retryCount || 0) + 1;

        await new Promise((resolve) =>
          setTimeout(
            resolve,
            API_CONFIG.RETRY_DELAY *
              originalRequest._retryCount
          )
        );

        return api(originalRequest);
      }

      toast.error(
        "Network error. Please check your connection."
      );

      return Promise.reject(error);
    }

    const status = error.response.status;

    // --------------------------------------------------------
    // 401 Unauthorized: refresh JWT
    // --------------------------------------------------------

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh
    ) {
      const requestUrl = originalRequest.url || "";

      const isLoginRequest =
        requestUrl.includes("/auth/login/");

      const isRefreshRequest =
        requestUrl.includes("/token/refresh/");

      if (!isLoginRequest && !isRefreshRequest) {
        originalRequest._retry = true;

        try {
          await refreshAccessToken();

          // Retry original request with newly issued cookie.
          return api(originalRequest);

        } catch (refreshError) {
          console.error(
            "Token refresh failed:",
            refreshError.response?.data ||
              refreshError.message
          );

          // Clear frontend user information only.
          // JWT cookies are deleted by the backend logout flow.
          localStorage.removeItem("user");

          if (
            window.location.pathname !== "/login"
          ) {
            window.location.href = "/login";

            toast.error(
              "Session expired. Please login again."
            );
          }

          return Promise.reject(refreshError);
        }
      }
    }

    // --------------------------------------------------------
    // HTTP errors
    // --------------------------------------------------------

    const { data } = error.response;

    switch (status) {
      case 400: {
        if (data && typeof data === "object") {
          const errorMessages = Object.entries(data)
            .map(([field, errors]) => {
              return `${field}: ${
                Array.isArray(errors)
                  ? errors.join(", ")
                  : errors
              }`;
            })
            .join("\n");

          toast.error(
            `Validation Error: ${errorMessages}`
          );
        }
        break;
      }

      case 401:
        // Authentication failure.
        // Login errors should be handled by LoginPage.
        break;

      case 403:
        if (
          typeof data?.detail === "string" &&
          data.detail.toLowerCase().includes("csrf")
        ) {
          console.error(
            "CSRF validation failed:",
            data.detail
          );

          toast.error(
            "Security verification failed. Please reload and try again."
          );
        } else {
          toast.error(
            "You do not have permission to perform this action."
          );
        }
        break;

      case 404:
        toast.error(
          "The requested resource was not found."
        );
        break;

      case 429:
        toast.error(
          "Too many requests. Please try again later."
        );
        break;

      case 500:
        toast.error(
          "Server error. Please try again later."
        );
        break;

      default:
        if (data?.detail) {
          console.error("API error:", data.detail);
        } else if (data?.error) {
          toast.error(data.error);
        } else {
          toast.error(
            "An unexpected error occurred."
          );
        }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// 7. API Services
// ============================================================

export const ApiService = {
  // ----------------------------------------------------------
  // Authentication
  // ----------------------------------------------------------

  auth: {
    // CSRF is automatically initialized by request interceptor.
    login: (credentials) =>
      api.post("/auth/login/", credentials),

    register: (userData) =>
      api.post("/auth/register/", userData),

    getProfile: () =>
      api.get("/auth/profile/"),

    updateProfile: (userData) =>
      api.put("/auth/profile/", userData),

    changePassword: (passwordData) =>
      api.post(
        "/auth/password-change/",
        passwordData
      ),

    resetPassword: (email) =>
      api.post(
        "/auth/password/reset/",
        { email }
      ),

    logout: () =>
      api.post("/logout/"),

    refresh: () =>
      refreshAccessToken(),
  },

  // ----------------------------------------------------------
  // Products
  // ----------------------------------------------------------

  products: {
    getAll: (params = {}) =>
      api.get("/products/", { params }),

    getById: (id) =>
      api.get(`/products/${id}/`),

    create: (productData) =>
      api.post("/products/", productData),

    update: (id, productData) =>
      api.put(`/products/${id}/`, productData),

    delete: (id) =>
      api.delete(`/products/${id}/`),

    search: (query, params = {}) =>
      api.get("/search/", {
        params: {
          q: query,
          ...params,
        },
      }),
  },

  // ----------------------------------------------------------
  // Orders
  // ----------------------------------------------------------

  orders: {
    getMyOrders: (params = {}) =>
      api.get("/orders/", { params }),

    getById: (id) =>
      api.get(`/orders/${id}/`),

    create: (orderData) =>
      api.post("/orders/", orderData),

    update: (id, orderData) =>
      api.put(`/orders/${id}/`, orderData),

    cancel: (id) =>
      api.post(`/orders/${id}/cancel/`),
  },

  // ----------------------------------------------------------
  // Utilities
  // ----------------------------------------------------------

  utils: {
    contactUs: (contactData) =>
      api.post("/contact/", contactData),

    healthCheck: () =>
      api.get("/health/"),
  },

  // ----------------------------------------------------------
  // Pagination
  // ----------------------------------------------------------

  paginate: (url, params = {}) =>
    api.get(url, { params }),
};

// ============================================================
// 8. Error helper
// ============================================================

export const handleApiError = (
  error,
  customMessage = null
) => {
  if (error.response) {
    const { status, data } = error.response;

    if (customMessage) {
      return {
        success: false,
        message: customMessage,
        status,
        data,
      };
    }

    if (data?.detail) {
      return {
        success: false,
        message: data.detail,
        status,
        data,
      };
    }

    if (data?.error) {
      return {
        success: false,
        message: data.error,
        status,
        data,
      };
    }

    return {
      success: false,
      message: `Server error (${status})`,
      status,
      data,
    };
  }

  if (error.request) {
    return {
      success: false,
      message:
        "Network error. Please check your connection.",
      status: null,
      data: null,
    };
  }

  return {
    success: false,
    message:
      error.message ||
      "An unexpected error occurred.",
    status: null,
    data: null,
  };
};

// ============================================================
// 9. API call helper
// ============================================================

export const apiCall = async (
  apiFunction,
  ...args
) => {
  try {
    const response = await apiFunction(...args);

    return {
      success: true,
      data: response.data,
      response,
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export default api;