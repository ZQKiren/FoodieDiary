import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ShareButton from './ShareButton';

const BookmarkCard = ({ post, onBookmarkRemove }) => {
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`h-5 w-5 ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const handleRemoveBookmark = () => {
    if (window.confirm('Remove this post from your bookmarks?')) {
      onBookmarkRemove();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative h-48 w-full">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Bookmarked
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {post.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-2 flex items-center">
          <svg
            className="h-4 w-4 mr-1 text-gray-400"
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
          {post.location}
        </p>
        
        <div className="flex items-center space-x-2 mb-3">
          {renderStars(post.rating)}
          <span className="text-sm text-gray-600">{post.rating}/5</span>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 flex items-center">
          <svg
            className="h-4 w-4 mr-1 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {format(new Date(post.eatenAt), 'MMMM d, yyyy')}
        </p>
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
          {post.review}
        </p>
        
        <div className="flex items-center mb-4 p-2 bg-gray-50 rounded-md">
          <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 text-sm">
            {post.user?.name ? post.user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium text-gray-900">
              {post.user?.name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500">Post author</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          
          <Link
            to={`/shared/${post.id}`}
            className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-green-600 hover:text-green-700 border border-green-100 hover:border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <svg
              className="mr-1.5 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View Details
          </Link>
          
          <ShareButton postId={post.id} />
          
          <button
            onClick={handleRemoveBookmark}
            className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:text-red-700 border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <svg
              className="mr-1.5 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            Remove Bookmark
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;