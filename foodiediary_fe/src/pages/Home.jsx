import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  return (
    <div>
      <section className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm mb-10">
        <div className="py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Welcome to Foodie Diary
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Keep track of all your food adventures in one place. Record what you ate,
            where you ate it, and share your thoughts with fellow food lovers.
          </p>
          
          {user ? (
            <div className="space-y-4">
              <Link
                to="/new-post"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Share Your Latest Food Experience
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
              
              <div>
                <Link
                  to="/my-posts"
                  className="inline-flex items-center px-4 py-2 border border-green-300 text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-colors"
                >
                  View My Food Diary
                </Link>
              </div>
            </div>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Start Your Food Journey
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

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Food Lovers Choose Foodie Diary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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
              Chronicle Your Culinary Adventures
            </h3>
            <p className="text-gray-600">
              Capture every delicious moment with photos, ratings, and detailed reviews. 
              Build your personal food history and never forget a great meal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Discover Hidden Gems
            </h3>
            <p className="text-gray-600">
              Track where you've been and discover new places through location-based 
              organization. Build your personal map of culinary discoveries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Share Your Passion
            </h3>
            <p className="text-gray-600">
              Connect with fellow food enthusiasts by sharing your favorite dishes 
              and discovering recommendations from the community.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your Food Story Starts Here
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of food lovers who use Foodie Diary to capture, 
          organize, and share their culinary experiences. From street food 
          adventures to fine dining moments, every meal has a story.
        </p>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-green-700 font-medium">
              Welcome back! Ready to add your latest food experience?
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/new-post"
                className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Create New Post
              </Link>
              <Link
                to="/my-posts"
                className="inline-flex items-center px-5 py-2 border border-green-300 text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-colors"
              >
                View My Diary
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-5 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;