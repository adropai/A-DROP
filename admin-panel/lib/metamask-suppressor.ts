// Suppress MetaMask errors since we don't use crypto features
if (typeof window !== 'undefined') {
  // Override console.error to filter out MetaMask related errors
  const originalConsoleError = console.error;
  
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    // List of MetaMask error patterns to suppress
    const metamaskPatterns = [
      'Failed to connect to MetaMask',
      'MetaMask extension not found',
      'ethereum is not defined',
      'window.ethereum',
      'inpage.js',
      'scripts/inpage.js'
    ];
    
    // Check if the error is MetaMask related
    const isMetaMaskError = metamaskPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Only log non-MetaMask errors
    if (!isMetaMaskError) {
      originalConsoleError.apply(console, args);
    }
  };
  
  // Also suppress unhandled promise rejections related to MetaMask
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || event.reason?.toString() || '';
    
    const metamaskPatterns = [
      'Failed to connect to MetaMask',
      'MetaMask extension not found',
      'ethereum is not defined'
    ];
    
    const isMetaMaskError = metamaskPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isMetaMaskError) {
      event.preventDefault(); // Prevent the error from being logged
    }
  });
}

export {};
