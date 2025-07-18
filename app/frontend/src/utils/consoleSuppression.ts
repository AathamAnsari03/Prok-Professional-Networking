// Console warning suppression for development
export const suppressConsoleWarnings = () => {
  if (import.meta.env.DEV) {
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args: any[]) => {
      const message = args[0];
      
      // Suppress specific warnings
      if (
        typeof message === 'string' &&
        (
          message.includes('findDOMNode is deprecated') ||
          message.includes('DOMNodeInserted') ||
          message.includes('React Router Future Flag Warning')
        )
      ) {
        return;
      }
      
      originalWarn.apply(console, args);
    };
    
    console.error = (...args: any[]) => {
      const message = args[0];
      
      // Suppress specific errors
      if (
        typeof message === 'string' &&
        message.includes('DOMNodeInserted')
      ) {
        return;
      }
      
      originalError.apply(console, args);
    };
  }
}; 