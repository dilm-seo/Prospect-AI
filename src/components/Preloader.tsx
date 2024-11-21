import React from 'react';

export function Preloader() {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="relative">
        <div className="h-24 w-24">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-indigo-400 opacity-75"></div>
          <div className="absolute h-16 w-16 animate-pulse rounded-full bg-indigo-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
        <p className="mt-4 text-center text-sm font-medium text-gray-600">
          Chargement...
        </p>
      </div>
    </div>
  );
}