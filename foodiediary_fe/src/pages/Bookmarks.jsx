import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookmarkService from '../services/bookmarks';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/posts/PostCard';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookmarks();
  }, [page]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await bookmarkService.getUserBookmarks(page, 10);
      setBookmarks(response.posts);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      showToast('Failed to load bookmarks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId) => {
    try {
      await bookmarkService.toggleBookmark(postId);
      showToast('Bookmark removed successfully', 'success');
      fetchBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      showToast('Failed to remove bookmark', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookmarks found
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't bookmarked any food posts yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            <svg
              className="mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Discover food posts
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {bookmarks.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onBookmarkRemove={() => handleRemoveBookmark(post.id)}
                isBookmarkView={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {[...Array(totalPages).keys()].map((num) => (
                    <button
                      key={num + 1}
                      onClick={() => setPage(num + 1)}
                      className={`px-3 py-1 rounded-md ${
                        page === num + 1
                          ? 'bg-green-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {num + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Bookmarks;