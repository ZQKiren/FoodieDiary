import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

// Create a custom render function that includes all providers
function customRender(ui, options = {}) {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {ui}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>,
    options
  );
}

// Re-export everything from RTL
export * from '@testing-library/react';

// Override render method
export { customRender as render };