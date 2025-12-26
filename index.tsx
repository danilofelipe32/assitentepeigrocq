
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Declare global libraries loaded via script tags
declare const pdfjsLib: any;

// --- Resilient PDF.js Worker Initialization ---
if (typeof pdfjsLib !== 'undefined') {
    const PDF_JS_VERSION = '4.4.168';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.mjs`;
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
