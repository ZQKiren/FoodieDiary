import { useState, useEffect } from 'react';
import bookmarkService from '../../services/bookmarks';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const BookmarkButton = ({ postId }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user && postId) {
      checkBookmarkStatus();
    }
  }, [postId, user]);

  const checkBookmarkStatus = async () => {
    try {
      const { isBookmarked } = await bookmarkService.checkBookmark(postId);
      setIsBookmarked(isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      showToast('Please login to bookmark posts', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await bookmarkService.toggleBookmark(postId);
      setIsBookmarked(response.isBookmarked);
      showToast(response.message, 'success');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showToast('Failed to update bookmark', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading}
      className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
        isBookmarked 
          ? 'text-yellow-600 hover:text-yellow-700 border border-yellow-100 hover:border-yellow-200 bg-yellow-50' 
          : 'text-gray-600 hover:text-gray-700 border border-gray-100 hover:border-gray-200'
      }`}
    >
      <svg
        className={`mr-1.5 h-4 w-4 ${isBookmarked ? 'text-yellow-500' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        fill={isBookmarked ? 'currentColor' : 'none'}
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
      Bookmark
    </button>
  );
};

export default BookmarkButton;