const cloudinary = require('cloudinary').v2;

// Mock cloudinary before requiring the module under test
jest.mock('cloudinary', () => {
  const mockCloudinary = {
    v2: {
      config: jest.fn(),
      uploader: {
        upload: jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/test.jpg' }),
        upload_stream: jest.fn()
      }
    }
  };
  
  return mockCloudinary;
});

describe('Cloudinary Configuration', () => {
  let cloudinaryConfig;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // Set the environment variable
    process.env.CLOUDINARY_URL = 'cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@abcde';
    
    // Import the module under test AFTER setting up mocks and env vars
    cloudinaryConfig = require('../../config/cloudinary');
  });
  
  test('cloudinary is configured with environment variables', () => {
    // The config function should have been called when the module was required
    expect(cloudinary.v2.config).toHaveBeenCalledWith({
      url: 'cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@abcde'
    });
  });
  
  test('cloudinary export is the configured v2 instance', () => {
    // The module should export cloudinary.v2
    expect(cloudinaryConfig).toBe(cloudinary.v2);
  });
  
  test('cloudinary handles missing environment variables', () => {
    // Reset modules for a clean state
    jest.resetModules();
    
    // Remove environment variable
    delete process.env.CLOUDINARY_URL;
    
    // Clear previous mock calls
    jest.clearAllMocks();
    
    // Re-require the module - should not throw error when env var is missing
    require('../../config/cloudinary');
    
    // Config should still be called (with undefined or empty values)
    expect(cloudinary.v2.config).toHaveBeenCalled();
  });
});