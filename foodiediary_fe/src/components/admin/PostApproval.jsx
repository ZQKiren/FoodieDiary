import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import adminService from '../../services/admin';
import { useToast } from '../../context/ToastContext';

const PostApproval = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [approvalFilter, setApprovalFilter] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, minRating, approvalFilter]);

  useEffect(() => {
    console.log('URL changed:', location.search);
    const params = new URLSearchParams(location.search);
    const approvedParam = params.get('approved');

    const newFilter = approvedParam === 'true' ? 'true' :
      approvedParam === 'false' ? 'false' : '';
    
    console.log('Processing URL params: current filter=', approvalFilter, 'new filter=', newFilter);
    
    if (newFilter !== approvalFilter) {
      setApprovalFilter(newFilter);
    }
    
    setUrlParamsProcessed(true);
  }, [location.search]);

  useEffect(() => {
    if (!urlParamsProcessed) {
      console.log('Skipping fetch - URL params not processed yet');
      return;
    }
    
    console.log('Fetching posts with filter:', approvalFilter);
    fetchPosts();
  }, [page, search, minRating, approvalFilter, urlParamsProcessed]);

  
  const fetchPosts = async () => {
    if (loading && posts.length > 0) return; 

    setLoading(true);
    try {
      
      let approved;
      if (approvalFilter === 'true') approved = true;
      else if (approvalFilter === 'false') approved = false;
      console.log('API call with approval filter:', approved);

      const response = await adminService.getAllPosts(
        page,
        10,
        search,
        minRating,
        approved
      );
      
      console.log(`Fetched ${response.posts.length} posts`);
      console.log('Posts approval statuses:', response.posts.map(p => 
        ({id: p.id, title: p.title, approved: p.isApproved})
      ));
      
      setPosts(response.posts);
      setTotalPages(response.totalPages);
      setTotalPosts(response.totalPosts || response.total || 0); 
    } catch (error) {
      console.error('Error fetching posts:', error);
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalToggle = async (id, currentStatus) => {
    try {
      await adminService.updatePostStatus(id, !currentStatus);
      showToast(
        `Post ${!currentStatus ? 'approved' : 'hidden'} successfully`,
        'success'
      );
      fetchPosts(); 
    } catch (error) {
      console.error('Error updating post status:', error);
      showToast('Failed to update post status', 'error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchTerm);
  };

  const handleRatingFilter = (e) => {
    setMinRating(parseInt(e.target.value));
  };

  const handleApprovalFilter = (e) => {
    const value = e.target.value;

    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('approved', value);
    } else {
      params.delete('approved');
    }

    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const getPageInfo = () => {
    if (approvalFilter === 'false') {
      return {
        title: 'Pending Approvals',
        description: 'Review and approve submitted food posts'
      };
    } else if (approvalFilter === 'true') {
      return {
        title: 'Approved Posts',
        description: 'Manage all approved food posts'
      };
    } else {
      return {
        title: 'Posts Management',
        description: 'Review and manage all food posts'
      };
    }
  };

  const openPostDetail = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePostDetail = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleApproveFromModal = async () => {
    if (selectedPost) {
      await handleApprovalToggle(selectedPost.id, selectedPost.isApproved);
      closePostDetail();
    }
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'
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

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-[600px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{pageInfo.title}</h1>
        <p className="text-gray-600">
          {pageInfo.description}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or location"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
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
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-4 text-gray-600 hover:text-gray-900 text-sm"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center space-x-2">
            <label htmlFor="rating" className="text-sm text-gray-700 whitespace-nowrap">
              Rating:
            </label>
            <select
              id="rating"
              value={minRating}
              onChange={handleRatingFilter}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 flex-grow text-sm"
            >
              <option value="0">All Ratings</option>
              <option value="1">★ and above</option>
              <option value="2">★★ and above</option>
              <option value="3">★★★ and above</option>
              <option value="4">★★★★ and above</option>
              <option value="5">★★★★★ only</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="approval" className="text-sm text-gray-700 whitespace-nowrap">
              Status:
            </label>
            <select
              id="approval"
              value={approvalFilter}
              onChange={handleApprovalFilter}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 flex-grow text-sm"
            >
              <option value="">All</option>
              <option value="true">Approved</option>
              <option value="false">Pending Approval</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No posts found
          </h3>
          <p className="text-gray-600">
            No posts match your current filter criteria.
          </p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300">
          <div className="block md:hidden">
            <div className="space-y-4 p-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-gray-400"
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{post.title}</h4>
                      <p className="text-xs text-gray-500">{post.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{post.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {renderStars(post.rating)}
                      <span className="text-xs text-gray-500">({post.rating})</span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${
                        post.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {post.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {format(new Date(post.eatenAt), 'MMM d, yyyy')}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openPostDetail(post)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-blue-300 text-sm rounded-md text-blue-700 bg-white hover:bg-blue-50"
                    >
                      Detail
                    </button>
                    {!post.isApproved ? (
                      <button
                        onClick={() => handleApprovalToggle(post.id, post.isApproved)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-green-300 text-sm rounded-md text-green-700 bg-white hover:bg-green-50"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprovalToggle(post.id, post.isApproved)}
                        className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-yellow-300 text-sm rounded-md text-yellow-700 bg-white hover:bg-yellow-50"
                      >
                        Hide
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Post
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rating
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                          {post.image ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <svg
                                className="h-6 w-6 text-gray-400"
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
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {post.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {post.user?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {post.user?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(post.rating)}
                        <span className="ml-1 text-sm text-gray-500">
                          ({post.rating})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(post.eatenAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => openPostDetail(post)}
                          className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm rounded-md text-blue-700 bg-white hover:bg-blue-50"
                        >
                          Detail
                        </button>

                        {!post.isApproved ? (
                          <button
                            onClick={() => handleApprovalToggle(post.id, post.isApproved)}
                            className="inline-flex items-center px-3 py-1 border border-green-300 text-sm rounded-md text-green-700 bg-white hover:bg-green-50"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprovalToggle(post.id, post.isApproved)}
                            className="inline-flex items-center px-3 py-1 border border-yellow-300 text-sm rounded-md text-yellow-700 bg-white hover:bg-yellow-50"
                          >
                            Hide
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * 10, totalPosts)}
                    </span>{' '}
                    of <span className="font-medium">{totalPosts}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            page === pageNum
                              ? 'z-10 bg-green-50 border-green-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closePostDetail}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={closePostDetail}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {selectedPost.title}
                  </h3>

                  <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Poster:</span>
                        <p className="text-sm text-gray-900">{selectedPost.user?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Email:</span>
                        <p className="text-sm text-gray-900 break-words">{selectedPost.user?.email || 'No email'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Location:</span>
                        <p className="text-sm text-gray-900 break-words">{selectedPost.location}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Rating:</span>
                        <div className="flex items-center">
                          {renderStars(selectedPost.rating)}
                          <span className="ml-1 text-sm text-gray-900">({selectedPost.rating})</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Date:</span>
                        <p className="text-sm text-gray-900">
                          {format(new Date(selectedPost.eatenAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <span className={`text-sm font-medium ${selectedPost.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                          {selectedPost.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedPost.review && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review:
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto">
                        <p className="text-sm text-gray-800 whitespace-pre-line">
                          {selectedPost.review}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedPost.image && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image:
                      </label>
                      <div className="border border-gray-300 rounded-md overflow-hidden">
                        <img
                          src={selectedPost.image}
                          alt={selectedPost.title}
                          className="w-full h-auto object-contain max-h-60"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                {!selectedPost.isApproved ? (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleApproveFromModal}
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-yellow-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-yellow-700 hover:bg-yellow-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleApproveFromModal}
                  >
                    Hide
                  </button>
                )}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closePostDetail}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostApproval;