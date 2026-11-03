import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingSpinner Component
 * Reusable loading spinner with multiple variants and sizes
 *
 * Usage:
 * <LoadingSpinner />
 * <LoadingSpinner variant="primary" size="lg" message="Loading products..." />
 */

const LoadingSpinner = ({
  variant = 'primary',
  size = 'md',
  message = '',
  fullScreen = false,
  inline = false,
  className = ''
}) => {
  // Size mapping
  const sizeMap = {
    xs: { spinner: 'spinner-border-sm', text: 'fs-6' },
    sm: { spinner: '', text: 'fs-6' },
    md: { spinner: '', text: 'fs-5' },
    lg: { spinner: 'spinner-border-lg', text: 'fs-4' },
    xl: { spinner: 'spinner-border-lg', text: 'fs-3' }
  };

  // Variant mapping
  const variantMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    info: 'text-info',
    light: 'text-light',
    dark: 'text-dark'
  };

  const { spinner: spinnerSizeClass, text: textSizeClass } = sizeMap[size] || sizeMap.md;
  const variantClass = variantMap[variant] || variantMap.primary;

  // Full screen loader
  if (fullScreen) {
    return (
      <div className={`loading-spinner-fullscreen ${className}`}>
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
          <div className={`spinner-border ${spinnerSizeClass} ${variantClass}`} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {message && (
            <div className={`mt-3 ${textSizeClass} text-center`}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Inline loader
  if (inline) {
    return (
      <div className={`d-inline-flex align-items-center ${className}`}>
        <div className={`spinner-border ${spinnerSizeClass} ${variantClass} me-2`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        {message && <span className={textSizeClass}>{message}</span>}
      </div>
    );
  }

  // Default centered loader
  return (
    <div className={`loading-spinner-default ${className}`}>
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className={`spinner-border ${spinnerSizeClass} ${variantClass}`} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        {message && (
          <div className={`mt-3 ${textSizeClass} text-center`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  inline: PropTypes.bool,
  className: PropTypes.string
};

// Button loading spinner (for submit buttons)
export const ButtonSpinner = ({ variant = 'light', size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'spinner-border-sm' : '';

  return (
    <div className={`spinner-border ${sizeClass} ${variant === 'light' ? 'text-light' : 'text-dark'} me-2`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

ButtonSpinner.propTypes = {
  variant: PropTypes.oneOf(['light', 'dark']),
  size: PropTypes.oneOf(['sm', 'md'])
};

// Skeleton loader for content
export const SkeletonLoader = ({
  type = 'text',
  count = 1,
  width = '100%',
  height = '1rem',
  className = ''
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`skeleton-loader skeleton-${type} ${className}`}
      style={{
        width: type === 'text' ? width : undefined,
        height: type === 'text' ? height : undefined,
        borderRadius: type === 'circle' ? '50%' : '0.25rem'
      }}
    />
  ));

  return <>{skeletons}</>;
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(['text', 'circle', 'rectangle']),
  count: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string
};

// Content loader with skeleton
export const ContentLoader = ({ children, isLoading, skeletonProps }) => {
  if (isLoading) {
    return <SkeletonLoader {...skeletonProps} />;
  }
  return children;
};

ContentLoader.propTypes = {
  children: PropTypes.node.isRequired,
  isLoading: PropTypes.bool.isRequired,
  skeletonProps: PropTypes.object
};

// CSS for skeleton loader (should be added to index.css)
export const skeletonLoaderStyles = `
  .skeleton-loader {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    margin-bottom: 0.5rem;
  }

  .skeleton-text {
    height: 1rem;
  }

  .skeleton-circle {
    width: 3rem;
    height: 3rem;
  }

  .skeleton-rectangle {
    height: 200px;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export default LoadingSpinner;