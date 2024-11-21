import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ProspectionProvider } from './context/ProspectionContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorAlert } from './components/ErrorAlert';
import { Preloader } from './components/Preloader';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Prospects from './pages/Prospects';

function App() {
  return (
    <ErrorBoundary>
      <ProspectionProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-grow">
              <ErrorAlert />
              <Suspense fallback={<Preloader />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/prospects" element={<Prospects />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Suspense>
            </main>
            <footer className="bg-white shadow-lg mt-auto">
              <div className="container mx-auto px-4 py-3">
                <p className="text-center text-sm text-gray-600">
                  Site web créé par <a href="https://dilm.fr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">DILM SEO</a>
                </p>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </ProspectionProvider>
    </ErrorBoundary>
  );
}

export default App;