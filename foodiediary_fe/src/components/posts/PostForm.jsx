import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../common/ImageUpload';
import postService from '../../services/posts';

import { 
  validatePostForm,
  validateSingleField,
  hasValidationErrors, 
  getFirstValidationError,
  getAllValidationErrors,
  getValidationErrorCount 
} from '../../utils/validation';

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
  const [errors, setErrors] = useState({});
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

  const validateFieldRealTime = (fieldName, fieldValue) => {
    const tempFormData = {
      ...formData,
      [fieldName]: fieldValue
    };
    
    const fieldError = validateSingleField(
      fieldName, 
      fieldValue, 
      tempFormData, 
      validatePostForm
    );
    
    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: fieldError
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    validateFieldRealTime(name, value);
  };

  const handleImageChange = (file) => {
    setFormData(prevData => ({
      ...prevData,
      image: file,
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prevData => ({
      ...prevData,
      rating: rating,
    }));
    
    validateFieldRealTime('rating', rating);
  };

  const handleMouseEnter = (rating) => {
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validatePostForm(formData);
    setErrors(validationErrors);
    
    if (hasValidationErrors(validationErrors)) {
      const allErrors = getAllValidationErrors(validationErrors);
      const errorCount = getValidationErrorCount(validationErrors);
      
      let errorMessage;
      
      if (errorCount === 1) {
        errorMessage = getFirstValidationError(validationErrors);
      } else {
        errorMessage = `Please fix ${errorCount} errors before submitting`;
      }
      
      showToast(errorMessage, 'error');
      
      const firstErrorField = Object.keys(validationErrors).find(
        field => validationErrors[field] !== ''
      );
      
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      return;
    }

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

  const renderStarRating = () => {
    const stars = [];
    const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

    for (let i = 0; i < 5; i++) {
      const currentRating = i + 1;
      const isActive = (hoverRating || formData.rating) >= currentRating;
      
      stars.push(
        <div key={i} className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleRatingClick(currentRating)}
            onMouseEnter={() => handleMouseEnter(currentRating)}
            onMouseLeave={handleMouseLeave}
            className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
            aria-label={`Rate ${currentRating} out of 5 stars - ${ratingLabels[i]}`}
          >
            <svg
              className={`h-8 w-8 cursor-pointer transition-colors duration-150 ${
                isActive ? 'text-yellow-400' : 'text-gray-300'
              }`}
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
            Food Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors ${
              errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="What did you eat? (e.g., Phở Bò, Pizza Margherita)"
            aria-describedby={errors.title ? "title-error" : "title-help"}
          />
          {errors.title && (
            <p id="title-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.title}
            </p>
          )}
          <p id="title-help" className="mt-1 text-xs text-gray-500">
            {formData.title.length}/100 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors ${
              errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Restaurant name and/or address (e.g., Phở 24, District 1)"
            aria-describedby={errors.location ? "location-error" : "location-help"}
          />
          {errors.location && (
            <p id="location-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.location}
            </p>
          )}
          <p id="location-help" className="mt-1 text-xs text-gray-500">
            {formData.location.length}/200 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-md border">
            {renderStarRating()}
          </div>
          
          <input 
            type="hidden" 
            id="rating"
            name="rating" 
            value={formData.rating} 
          />
          
          {errors.rating && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.rating}
            </p>
          )}
          
          <p className="mt-1 text-xs text-gray-500">
            Current rating: {formData.rating}/5 stars
          </p>
        </div>

        <div>
          <label
            htmlFor="eatenAt"
            className="block text-sm font-medium text-gray-700"
          >
            Date Eaten <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="eatenAt"
            name="eatenAt"
            required
            value={formData.eatenAt}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors ${
              errors.eatenAt ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            aria-describedby={errors.eatenAt ? "date-error" : "date-help"}
          />
          {errors.eatenAt && (
            <p id="date-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.eatenAt}
            </p>
          )}
          <p id="date-help" className="mt-1 text-xs text-gray-500">
            📅 Please select the date when you actually ate this food (cannot be in the future)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Photo <span className="text-gray-400">(Optional)</span>
          </label>
          <ImageUpload
            onChange={handleImageChange}
            currentImage={formData.image}
          />
          <p className="mt-1 text-xs text-gray-500">
            Add a photo to make your post more engaging
          </p>
        </div>

        <div>
          <label
            htmlFor="review"
            className="block text-sm font-medium text-gray-700"
          >
            Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review"
            name="review"
            rows="4"
            required
            value={formData.review}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors ${
              errors.review ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Share your thoughts about this food... How did it taste? What was special about it? Would you recommend it?"
            aria-describedby={errors.review ? "review-error" : "review-help"}
          />
          {errors.review && (
            <p id="review-error" className="mt-2 text-sm text-red-600" role="alert">
              {errors.review}
            </p>
          )}
          <p id="review-help" className="mt-1 text-xs text-gray-500">
            {formData.review.length}/2000 characters (minimum 5 characters)
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/my-posts')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
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