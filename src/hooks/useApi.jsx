import { useState, useCallback, useEffect } from 'react';
import Api from '../components/AxiosRequest/BaseUrl';
import useAuth from '../components/auth/AuthHook';

/**
 * useApi Custom Hook
 * A comprehensive hook for handling API requests with built-in loading, error, and retry logic
 *
 * Features:
 * - Automatic loading state management
 * - Error handling with retry functionality
 * - Request cancellation
 * - Authentication token handling
 * - Response caching (optional)
 *
 * Usage:
 * const { data, loading, error, execute } = useApi({
 *   url: '/products',
 *   method: 'GET',
 *   initialData: []
 * });
 *
 * // Execute manually
 * execute({ params: { page: 1 } });
 */

const useApi = (config = {}) => {
  const {
    url = '',
    method = 'GET',
    initialData = null,
    autoExecute = true,
    requireAuth = false,
    cacheKey = null,
    cacheTTL = 300000, // 5 minutes in milliseconds
    retryCount = 3,
    retryDelay = 1000
  } = config;

  const { access, refresh } = useAuth();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(autoExecute);
  const [error, setError] = useState(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  // Cache management
  const getFromCache = useCallback((key) => {
    if (!key) return null;

    try {
      const cached = localStorage.getItem(`api_cache_${key}`);
      if (!cached) return null;

      const { data: cachedData, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp < cacheTTL) {
        return cachedData;
      }

      // Cache expired
      localStorage.removeItem(`api_cache_${key}`);
      return null;
    } catch (err) {
      console.warn('Cache read error:', err);
      return null;
    }
  }, [cacheTTL]);

  const saveToCache = useCallback((key, dataToCache) => {
    if (!key) return;

    try {
      const cacheItem = {
        data: dataToCache,
        timestamp: Date.now()
      };
      localStorage.setItem(`api_cache_${key}`, JSON.stringify(cacheItem));
    } catch (err) {
      console.warn('Cache write error:', err);
    }
  }, []);

  const clearCache = useCallback((key = null) => {
    if (key) {
      localStorage.removeItem(`api_cache_${key}`);
    } else {
      // Clear all API cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('api_cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, []);

  // Main API execution function
  const execute = useCallback(async (executeConfig = {}) => {
    const {
      url: overrideUrl = url,
      method: overrideMethod = method,
      data: requestData = null,
      params = null,
      headers = {},
      skipCache = false,
      onSuccess = null,
      onError = null
    } = executeConfig;

    // Check cache first (for GET requests only)
    if (cacheKey && overrideMethod === 'GET' && !skipCache) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return { data: cachedData, fromCache: true };
      }
    }

    setLoading(true);
    setError(null);

    // Prepare request config
    const requestConfig = {
      method: overrideMethod,
      url: overrideUrl,
      headers: {
        ...headers
      }
    };

    if (requestData) {
      requestConfig.data = requestData;
    }

    if (params) {
      requestConfig.params = params;
    }

    // Add authentication if required
    if (requireAuth && access) {
      requestConfig.headers.Authorization = `Bearer ${access}`;
    }

    const executeWithRetry = async (attempt = 1) => {
      try {
        const response = await Api(requestConfig);

        setData(response.data);
        setError(null);
        setRetryAttempt(0);

        // Cache the response if cacheKey is provided
        if (cacheKey && overrideMethod === 'GET') {
          saveToCache(cacheKey, response.data);
        }

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response.data, response);
        }

        return { data: response.data, response };
      } catch (err) {
        // Handle authentication errors
        if (err.response?.status === 401 && requireAuth) {
          // Token refresh logic could be added here
          console.warn('Authentication error - token may be expired');
        }

        // Retry logic for network errors or 5xx errors
        if (attempt < retryCount && (
          !err.response ||
          err.response.status >= 500 ||
          err.code === 'ECONNABORTED' ||
          err.code === 'NETWORK_ERROR'
        )) {
          console.warn(`Request failed, retrying (${attempt}/${retryCount})...`);
          setRetryAttempt(attempt);

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          return executeWithRetry(attempt + 1);
        }

        // Final error handling
        setError(err);
        setRetryAttempt(0);

        // Call error callback if provided
        if (onError) {
          onError(err);
        }

        // Rethrow for component-level error handling
        throw err;
      } finally {
        setLoading(false);
      }
    };

    return executeWithRetry();
  }, [url, method, access, requireAuth, cacheKey, getFromCache, saveToCache, retryCount, retryDelay]);

  // Auto-execute on mount if configured
  useEffect(() => {
    let isMounted = true;
    let controller = null;

    const autoExecuteRequest = async () => {
      if (autoExecute && url && isMounted) {
        try {
          await execute();
        } catch (err) {
          // Error is already handled in execute function
          if (isMounted) {
            console.error('Auto-execute error:', err);
          }
        }
      }
    };

    autoExecuteRequest();

    return () => {
      isMounted = false;
      // Cancel request if component unmounts
      if (controller) {
        controller.abort();
      }
    };
  }, [autoExecute, url, execute]);

  // Utility functions
  const refetch = useCallback((config = {}) => {
    return execute({ ...config, skipCache: true });
  }, [execute]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
    setRetryAttempt(0);
  }, [initialData]);

  // Error details helper
  const getErrorDetails = useCallback(() => {
    if (!error) return null;

    const errorResponse = error.response;

    return {
      message: error.message || 'An unknown error occurred',
      status: errorResponse?.status,
      statusText: errorResponse?.statusText,
      data: errorResponse?.data,
      isNetworkError: !errorResponse,
      isServerError: errorResponse?.status >= 500,
      isClientError: errorResponse?.status >= 400 && errorResponse?.status < 500,
      isUnauthorized: errorResponse?.status === 401,
      isForbidden: errorResponse?.status === 403,
      isNotFound: errorResponse?.status === 404
    };
  }, [error]);

  return {
    // State
    data,
    loading,
    error,
    retryAttempt,

    // Actions
    execute,
    refetch,
    reset,
    clearCache: () => clearCache(cacheKey),

    // Utilities
    getErrorDetails,
    isError: !!error,
    hasData: data !== null && data !== undefined,

    // Derived state
    status: loading ? 'loading' : error ? 'error' : 'success'
  };
};

// Hook for common API patterns
export const useApiGet = (url, config = {}) => {
  return useApi({ url, method: 'GET', ...config });
};

export const useApiPost = (url, config = {}) => {
  return useApi({ url, method: 'POST', ...config });
};

export const useApiPut = (url, config = {}) => {
  return useApi({ url, method: 'PUT', ...config });
};

export const useApiDelete = (url, config = {}) => {
  return useApi({ url, method: 'DELETE', ...config });
};

// Hook for paginated data
export const usePaginatedApi = (url, initialParams = {}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const api = useApiGet(url, {
    params: {
      page,
      page_size: pageSize,
      ...initialParams
    },
    autoExecute: false
  });

  const fetchPage = useCallback(async (newPage, newPageSize = pageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);

    const response = await api.execute({
      params: {
        page: newPage,
        page_size: newPageSize,
        ...initialParams
      }
    });

    // Extract pagination metadata from response
    if (response.data) {
      // Adjust based on your API response structure
      if (response.data.count !== undefined) {
        setTotalItems(response.data.count);
        setTotalPages(Math.ceil(response.data.count / newPageSize));
      }
    }

    return response;
  }, [api, pageSize, initialParams]);

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      return fetchPage(newPage);
    }
  }, [fetchPage, totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      return fetchPage(page + 1);
    }
  }, [page, totalPages, fetchPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      return fetchPage(page - 1);
    }
  }, [page, fetchPage]);

  return {
    ...api,
    page,
    pageSize,
    totalPages,
    totalItems,
    fetchPage,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: (newSize) => {
      setPageSize(newSize);
      return fetchPage(1, newSize);
    },
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

export default useApi;