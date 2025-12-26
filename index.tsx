
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Declare global libraries loaded via script tags
declare const pdfjsLib: any;

// --- Resilient PDF.js Worker Initialization ---
if (typeof pdfjsLib !== 'undefined') {
    const PDF_JS_VERSION = (pdfjsLib as any).version;
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.js`;
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof pdfjsLib !== 'undefined') {
             const PDF_JS_VERSION = (pdfjsLib as any).version;
             (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.js`;
        }
    });
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
