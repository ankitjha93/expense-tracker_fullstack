import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(({ type = 'info', message, title, duration = 4000 }) => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        const newToast = { id, type, message, title };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const toast = {
        success: (message, title = 'Success') => addToast({ type: 'success', message, title }),
        error: (message, title = 'Error') => addToast({ type: 'error', message, title }),
        info: (message, title = 'Notice') => addToast({ type: 'info', message, title }),
        remove: removeToast,
    };

    return (
        <ToastContext.Provider value={{ toast, toasts, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
