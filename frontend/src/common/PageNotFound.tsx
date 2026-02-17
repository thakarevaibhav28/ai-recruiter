import React from 'react';

const PageNotFound: React.FC = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Animated 404 */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl md:text-[12rem] font-bold text-white opacity-20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <svg
                  className="w-16 h-16 md:w-20 md:h-20 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            The page you're looking for seems to have wandered off into the digital void. 
            Don't worry though, we'll help you find your way back!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Go Home
            </button>
            <button
              onClick={handleGoBack}
              className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-gray-200 transform hover:-translate-y-1 transition-all duration-200"
            >
              Go Back
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="mt-12 flex justify-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-white opacity-10 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default PageNotFound;