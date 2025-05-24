import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { 
  validateLoginForm,
  hasValidationErrors, 
  getAllValidationErrors,
  getValidationErrorCount 
} from '../utils/validation';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const validateFieldRealTime = (fieldName, fieldValue) => {
    const tempFormData = {
      ...formData,
      [fieldName]: fieldValue
    };
    
    const allErrors = validateLoginForm(tempFormData);
    
    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: allErrors[fieldName]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);
    
    if (hasValidationErrors(validationErrors)) {
      const allErrors = getAllValidationErrors(validationErrors);
      const errorCount = getValidationErrorCount(validationErrors);
      
      let errorMessage;
      
      if (errorCount === 1) {
        errorMessage = allErrors[0];
      } else {
        const emptyFields = [];
        if (validationErrors.email === 'Please fill out this field') {
          emptyFields.push('Email address');
        }
        if (validationErrors.password === 'Please fill out this field') {
          emptyFields.push('Password');
        }
        
        if (emptyFields.length > 0) {
          errorMessage = `Please fill out required fields: ${emptyFields.join(' and ')}`;
        } else {
          errorMessage = `Please fix ${errorCount} errors: ${allErrors.join('; ')}`;
        }
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
      await login(formData.email, formData.password);
      showToast('Login successful!', 'success');
      navigate(from, { replace: true });
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Login failed. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Register now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;