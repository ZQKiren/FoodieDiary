// src/pages/EditPost.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../components/posts/PostForm';
import postService from '../services/posts';
import { useToast } from '../context/ToastContext';

const EditPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postService.getPost(parseInt(id));
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        showToast('Failed to load post', 'error');
        navigate('/my-posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <PostForm post={post} isEditing={true} />
    </div>
  );
};

export default EditPost;