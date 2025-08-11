// Suppress deprecated warnings from Ant Design Pro Components
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];
  
  // Suppress specific Ant Design deprecation warnings
  if (typeof message === 'string' && (
    message.includes('dropdownRender is deprecated') ||
    message.includes('onDropdownVisibleChange is deprecated') ||
    message.includes('[antd: Select]') ||
    message.includes('[PERFORMANCE]') ||
    message.includes('[HYDRATION]') ||
    message.includes('[ANTDWARNINGS]') ||
    message.includes('[GENERAL]')
  )) {
    return;
  }
  
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args[0];
  
  // Suppress specific warnings that appear as errors
  if (typeof message === 'string' && (
    message.includes('Warning: [antd: Select]') ||
    message.includes('dropdownRender is deprecated') ||
    message.includes('onDropdownVisibleChange is deprecated') ||
    message.includes('[PERFORMANCE]') ||
    message.includes('[HYDRATION]') ||
    message.includes('[ANTDWARNINGS]') ||
    message.includes('[GENERAL]')
  )) {
    return;
  }
  
  originalError.apply(console, args);
};

// Export something to make this a module
export {};
