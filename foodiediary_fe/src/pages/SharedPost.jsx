import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import postService from '../services/posts';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import BookmarkButton from '../components/common/BookmarkButton';

const SharedPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await postService.getSharedPost(parseInt(id));
                setPost(data);
            } catch (error) {
                console.error('Error fetching shared post:', error);
                showToast('This post is not available or has been removed', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, showToast]);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <svg
                    key={i}
                    className={`h-5 w-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'
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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-medium text-gray-900">Post not found</h2>
                <p className="mt-2 text-gray-600">
                    The post you are looking for does not exist or has been removed.
                </p>
                <Link
                    to="/"
                    className="mt-4 inline-flex items-center text-green-600 hover:text-green-700"
                >
                    ← Go to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center text-green-600 hover:text-green-700"
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
                    Back to Home
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {post.image ? (
                    <div className="h-96 w-full bg-gray-200">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="h-full w-full object-cover object-center"
                        />
                    </div>
                ) : (
                    <div className="h-64 w-full bg-gray-200 flex items-center justify-center">
                        <svg
                            // Tiếp tục phần code component SharedPost:

                            className="h-16 w-16 text-gray-400"
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

                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                        <div className="flex space-x-2">
                            {user && <BookmarkButton postId={post.id} />}
                            {!user && (
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-3 py-1 border border-green-300 text-sm rounded-md text-green-700 bg-white hover:bg-green-50"
                                >
                                    Log in to bookmark
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                            <p className="text-gray-600 mb-1">{post.location}</p>
                            <p className="text-gray-500 text-sm">
                                {format(new Date(post.eatenAt), 'MMMM d, yyyy')}
                            </p>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0">
                            {renderStars(post.rating)}
                            <span className="ml-2 text-gray-700">{post.rating}/5</span>
                        </div>
                    </div>

                    <div className="prose max-w-none">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Review</h2>
                        <p className="whitespace-pre-line">{post.review}</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center text-green-800">
                                {post.user?.name ? post.user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                    {post.user?.name || 'Anonymous'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {!user && (
                        <div className="mt-8 bg-green-50 p-4 rounded-md">
                            <p className="text-green-800">
                                Like what you see? <Link to="/register" className="font-medium underline">Join Foodie Diary</Link> to create your own food memories!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SharedPost;