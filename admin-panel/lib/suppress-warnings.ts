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
    message.includes('[GENERAL]') ||
    message.includes('只在 form 初始化时生效') ||
    message.includes('initialValues 只在') ||
    message.includes('只在') ||
    message.includes('中文') ||
    message.includes('異步加載') ||
    message.includes('初始化') ||
    /[\u4e00-\u9fff]/.test(message) // Any Chinese characters
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
    message.includes('[GENERAL]') ||
    message.includes('只在 form 初始化时生效') ||
    message.includes('initialValues 只在') ||
    message.includes('只在') ||
    message.includes('中文') ||
    message.includes('異步加載') ||
    message.includes('初始化') ||
    /[\u4e00-\u9fff]/.test(message) // Any Chinese characters
  )) {
    return;
  }
  
  originalError.apply(console, args);
};

// Export something to make this a module
export {};
