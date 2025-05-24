import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookmarkService from '../services/bookmarks';
import { useToast } from '../context/ToastContext';
import BookmarkCard from '../components/common/BookmarkCard';

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
          <p className="text-gray-600 mt-1">
            Food posts you've saved for later reference
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="h-16 w-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookmarks found
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't bookmarked any food posts yet. Start exploring and save 
            posts that catch your interest!
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Discover food posts
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {bookmarks.map((post) => (
              <BookmarkCard
                key={post.id}
                post={post}
                onBookmarkRemove={() => handleRemoveBookmark(post.id)}
              />
            ))}
          </div>

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