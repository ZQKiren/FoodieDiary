// src/components/posts/PostCard.jsx
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PostCard = ({ post, onDelete }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
          {!post.isApproved && (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">
              Pending Approval
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{post.location}</p>
        <div className="flex items-center space-x-2 mb-3">
          {renderStars(post.rating)}
          <span className="text-sm text-gray-600">{post.rating}/5</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {format(new Date(post.eatenAt), 'MMMM d, yyyy')}
        </p>
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
          {post.review}
        </p>
        <div className="flex justify-between items-center">
          <Link
            to={`/posts/${post.id}`}
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            View Details
          </Link>
          <div className="flex space-x-2">
            <Link
              to={`/edit-post/${post.id}`}
              className="text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(post.id)}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;