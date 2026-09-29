import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GlobalStyle } from './styles/GlobalStyle';
import { GlobalProvider } from './context/globalContext';
import { AuthProvider } from './context/authContext';
import { ToastProvider } from './context/toastContext';
import ToastContainer from './Components/Toast/ToastContainer';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStyle/>
    <ToastProvider>
      <ToastContainer />
      <AuthProvider>
        <GlobalProvider>
          <App/>
        </GlobalProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
