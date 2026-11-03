import React from 'react';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Usage:
 * <ErrorBoundary fallback={<ErrorComponent />}>
 *   <YourComponent />
 * </ErrorBoundary>
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to console (in production, send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // You can also send to error tracking service here
    // Example: sendToErrorTrackingService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="container py-5 text-center">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h4 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Something went wrong
                </h4>
              </div>
              <div className="card-body">
                <div className="alert alert-warning">
                  <p className="mb-2">
                    <strong>We apologize for the inconvenience.</strong>
                  </p>
                  <p className="mb-3">
                    An unexpected error has occurred. Our team has been notified.
                  </p>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4">
                    <details className="alert alert-light">
                      <summary className="fw-bold">Error Details (Development Only)</summary>
                      <div className="mt-2">
                        <pre className="bg-dark text-white p-3 rounded small overflow-auto">
                          {this.state.error && this.state.error.toString()}
                          <br /><br />
                          {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}

                <div className="mt-4">
                  <button
                    className="btn btn-primary me-2"
                    onClick={this.handleRetry}
                  >
                    <i className="fas fa-redo me-2"></i>
                    Try Again
                  </button>

                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={() => window.location.reload()}
                  >
                    <i className="fas fa-sync-alt me-2"></i>
                    Reload Page
                  </button>

                  <button
                    className="btn btn-outline-primary"
                    onClick={() => window.location.href = '/'}
                  >
                    <i className="fas fa-home me-2"></i>
                    Go to Homepage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher Order Component for wrapping components with ErrorBoundary
export const withErrorBoundary = (WrappedComponent, fallback = null) => {
  return (props) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};

// Hook for error boundary context (if needed)
export const useErrorBoundary = () => {
  // This can be extended to provide error context if needed
  return {
    triggerError: (error) => {
      console.error('Manual error triggered:', error);
      // In a real implementation, this would trigger the error boundary
    }
  };
};

export default ErrorBoundary;