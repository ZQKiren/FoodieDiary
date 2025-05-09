// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm mb-10">
        <div className="py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Welcome to Foodie Diary
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Keep track of all your food adventures in one place. Record what you ate,
            where you ate it, and share your thoughts.
          </p>
          {user ? (
            <Link
              to="/new-post"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Create New Post
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Join Now
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-md flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Record Your Food Experiences
            </h3>
            <p className="text-gray-600">
              Save memories of your culinary adventures with details like
              location, rating, and personal review.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-md flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Food Photos
            </h3>
            <p className="text-gray-600">
              Add mouth-watering photos to your posts and create a visual food
              diary to look back on.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-md flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Filter and Search
            </h3>
            <p className="text-gray-600">
              Easily find past entries by searching for locations, dish names, or
              filtering by rating.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white p-8 rounded-lg shadow-sm text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Start Your Food Journey Today
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Whether you're a foodie, traveler, or just someone who enjoys good
          meals, Foodie Diary helps you keep track of your favorites.
        </p>
        {user ? (
          <Link
            to="/my-posts"
            className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Go to My Food Diary
          </Link>
        ) : (
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="inline-flex items-center px-5 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Create an Account
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;