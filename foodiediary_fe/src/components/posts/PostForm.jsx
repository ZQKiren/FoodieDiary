import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../common/ImageUpload';
import postService from '../../services/posts';

const PostForm = ({ post = null, isEditing = false }) => {
  const initialState = {
    title: '',
    location: '',
    review: '',
    rating: 5,
    eatenAt: new Date().toISOString().split('T')[0],
    image: null,
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (isEditing && post) {
      setFormData({
        title: post.title,
        location: post.location,
        review: post.review,
        rating: post.rating,
        eatenAt: new Date(post.eatenAt).toISOString().split('T')[0],
        image: post.image,
      });
    }
  }, [isEditing, post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (file) => {
    setFormData({
      ...formData,
      image: file,
    });
  };

  const handleRatingClick = (rating) => {
    setFormData({
      ...formData,
      rating: rating,
    });
  };

  const handleMouseEnter = (rating) => {
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await postService.updatePost(post.id, formData);
        showToast('Post updated successfully', 'success');
      } else {
        await postService.createPost(formData);
        showToast('Post created successfully', 'success');
      }
      navigate('/my-posts');
    } catch (error) {
      console.error('Error saving post:', error);
      showToast(
        error.response?.data?.message || 'Failed to save post',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to render star rating components
  const renderStarRating = () => {
    const stars = [];
    const ratings = [1, 2, 3, 4, 5];
    const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    for (let i = 0; i < 5; i++) {
      const currentRating = i + 1;
      stars.push(
        <div key={i} className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleRatingClick(currentRating)}
            onMouseEnter={() => handleMouseEnter(currentRating)}
            onMouseLeave={handleMouseLeave}
            className="focus:outline-none"
            aria-label={`Rate ${currentRating} out of 5 stars`}
          >
            <svg
              className={`h-8 w-8 ${
                (hoverRating || formData.rating) >= currentRating
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } cursor-pointer transition-colors duration-150`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
          <span className="text-xs text-gray-500 mt-1">
            {ratingLabels[i]}
          </span>
        </div>
      );
    }
    return stars;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Food Post' : 'Create Food Post'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Food Name
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="What did you eat?"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Restaurant name, City"
          />
        </div>

        <div>
          <label
            htmlFor="rating"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Rating
          </label>
          
          {/* Interactive Star Rating */}
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-md">
            {renderStarRating()}
          </div>
          
          {/* Hidden input to store the rating value */}
          <input 
            type="hidden" 
            name="rating" 
            value={formData.rating} 
          />
        </div>

        <div>
          <label
            htmlFor="eatenAt"
            className="block text-sm font-medium text-gray-700"
          >
            Date Eaten
          </label>
          <input
            type="date"
            id="eatenAt"
            name="eatenAt"
            required
            value={formData.eatenAt}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Food Photo
          </label>
          <ImageUpload
            onChange={handleImageChange}
            currentImage={formData.image}
          />
        </div>

        <div>
          <label
            htmlFor="review"
            className="block text-sm font-medium text-gray-700"
          >
            Review
          </label>
          <textarea
            id="review"
            name="review"
            rows="4"
            required
            value={formData.review}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Write your thoughts about this food..."
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/my-posts')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
          >
            {loading
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
              ? 'Update Post'
              : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;