import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if error is related to MetaMask
    const errorMessage = error?.message || '';
    const errorStack = error?.stack || '';
    
    const isMetaMaskError = 
      errorMessage.includes('Failed to connect to MetaMask') ||
      (errorMessage.includes('MetaMask') && errorMessage.includes('connect')) ||
      errorStack.includes('Failed to connect to MetaMask') ||
      (errorStack.includes('MetaMask') && errorStack.includes('connect')) ||
      errorStack.includes('nkbihfbeogaeaoehlefnkodbefgpgknn'); // MetaMask extension ID
    
    // If it's a MetaMask error, suppress it and don't show error boundary
    if (isMetaMaskError) {
      return null; // Don't update state, let the error be suppressed
    }
    
    // For other errors, show error boundary
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Check if error is related to MetaMask
    const errorMessage = error?.message || '';
    const errorStack = error?.stack || '';
    
    const isMetaMaskError = 
      errorMessage.includes('Failed to connect to MetaMask') ||
      (errorMessage.includes('MetaMask') && errorMessage.includes('connect')) ||
      errorStack.includes('Failed to connect to MetaMask') ||
      (errorStack.includes('MetaMask') && errorStack.includes('connect')) ||
      errorStack.includes('nkbihfbeogaeaoehlefnkodbefgpgknn');
    
    // Suppress MetaMask errors, log others
    if (!isMetaMaskError) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Only show error UI for non-MetaMask errors
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          marginTop: '50px'
        }}>
          <h2>Something went wrong.</h2>
          <p>Please refresh the page or contact support if the problem persists.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

