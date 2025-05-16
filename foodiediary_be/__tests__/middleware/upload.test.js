// __tests__/middleware/upload.test.js
// Mock dependencies before requiring the upload module
jest.mock('multer', () => {
  // Create a mock of the multer instance that will be returned
  const multerInstance = {
    single: jest.fn().mockReturnValue('multer middleware')
  };
  
  // Create the main multer mock function
  const mockMulter = jest.fn().mockReturnValue(multerInstance);
  
  // Add memoryStorage method
  mockMulter.memoryStorage = jest.fn().mockReturnValue('memory storage');
  
  return mockMulter;
});

jest.mock('path', () => ({
  extname: jest.fn()
}));

describe('Upload Middleware', () => {
  let multer;
  let path;
  let upload; // This will be the export from your module
  let fileFilter;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    jest.resetModules();
    
    // Import mocked modules
    multer = require('multer');
    path = require('path');
    
    // Capture the fileFilter when multer is called
    multer.mockImplementation(options => {
      fileFilter = options.fileFilter;
      return multer.mock.results[0].value; // Return the multerInstance
    });
    
    // Import the upload module - this will be the multer instance
    upload = require('../../middleware/upload');
  });
  
  test('configures multer with memory storage', () => {
    expect(multer.memoryStorage).toHaveBeenCalled();
    expect(multer).toHaveBeenCalledWith({
      storage: 'memory storage',
      limits: { fileSize: 5000000 }, // 5MB
      fileFilter: expect.any(Function)
    });
  });
  
  test('upload.single returns middleware function', () => {
    // Here upload is the multer instance with a single method
    const middleware = upload.single('image');
    expect(middleware).toBe('multer middleware');
  });
  
  test('fileFilter accepts valid image files', () => {
    // Verify fileFilter was captured
    expect(typeof fileFilter).toBe('function');
    
    // Mock for path.extname
    path.extname.mockReturnValue('.jpg');
    
    // Create test data
    const req = {};
    const file = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg'
    };
    const cb = jest.fn();
    
    // Call the fileFilter function
    fileFilter(req, file, cb);
    
    // Verify behavior
    expect(path.extname).toHaveBeenCalledWith('test.jpg');
    expect(cb).toHaveBeenCalledWith(null, true);
  });
  
  test('fileFilter rejects invalid files', () => {
    // Verify fileFilter was captured
    expect(typeof fileFilter).toBe('function');
    
    // Mock for path.extname
    path.extname.mockReturnValue('.pdf');
    
    // Create test data
    const req = {};
    const file = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf'
    };
    const cb = jest.fn();
    
    // Call the fileFilter function
    fileFilter(req, file, cb);
    
    // Verify behavior
    expect(path.extname).toHaveBeenCalledWith('test.pdf');
    expect(cb).toHaveBeenCalledWith(expect.any(Error));
    expect(cb.mock.calls[0][0].message).toBe('Only image files are allowed!');
  });
});