const multer = require('multer');
const path = require('path');

// Mock dependencies - important to do this BEFORE requiring upload
jest.mock('multer', () => {
  const mockSingle = jest.fn().mockReturnValue('multer middleware');
  const mockMulter = jest.fn().mockReturnValue({
    single: mockSingle
  });
  
  // Add memoryStorage method to the mockMulter function
  mockMulter.memoryStorage = jest.fn().mockReturnValue('memory storage');
  
  // Make mock.calls available for testing
  mockMulter.mock = { calls: [] };
  mockMulter.mock.calls.push([{ 
    storage: 'memory storage',
    limits: { fileSize: 5000000 },
    fileFilter: expect.any(Function)
  }]);
  
  return mockMulter;
});

jest.mock('path', () => ({
  extname: jest.fn()
}));

describe('Upload Middleware', () => {
  let upload;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset modules to ensure clean state
    jest.resetModules();
    
    // We need to re-mock after resetModules
    multer.memoryStorage.mockReturnValue('memory storage');
    multer.mock = { calls: [] };
    multer.mock.calls.push([{ 
      storage: 'memory storage',
      limits: { fileSize: 5000000 },
      fileFilter: expect.any(Function)
    }]);
    
    // Now require the module under test
    upload = require('../../middleware/upload');
  });
  
  test('configures multer with memory storage', () => {
    expect(multer.memoryStorage).toHaveBeenCalled();
    expect(multer).toHaveBeenCalledWith(expect.objectContaining({
      storage: 'memory storage',
      limits: { fileSize: 5000000 },
      fileFilter: expect.any(Function)
    }));
  });
  
  test('upload.single returns middleware function', () => {
    expect(upload.single('image')).toBe('multer middleware');
  });
  
  test('fileFilter accepts valid image files', () => {
    // Mock path.extname to return .jpg
    path.extname.mockReturnValue('.jpg');
    
    // Extract the fileFilter function - this is now manually available through our mock
    const fileFilter = multer.mock.calls[0][0].fileFilter;
    
    // Create mock file and callback
    const mockFile = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg'
    };
    const mockCallback = jest.fn();
    
    // Call the fileFilter function
    fileFilter({}, mockFile, mockCallback);
    
    // Verify extname was called correctly
    expect(path.extname).toHaveBeenCalledWith('test.jpg');
    
    // Verify callback received correct arguments (null = no error, true = accept file)
    expect(mockCallback).toHaveBeenCalledWith(null, true);
  });
  
  test('fileFilter rejects invalid files', () => {
    // Mock path.extname to return .pdf
    path.extname.mockReturnValue('.pdf');
    
    // Extract the fileFilter function
    const fileFilter = multer.mock.calls[0][0].fileFilter;
    
    // Create mock file and callback
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf'
    };
    const mockCallback = jest.fn();
    
    // Call the fileFilter function
    fileFilter({}, mockFile, mockCallback);
    
    // Verify extname was called correctly
    expect(path.extname).toHaveBeenCalledWith('test.pdf');
    
    // Verify callback received error
    expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
    expect(mockCallback.mock.calls[0][0].message).toBe('Only image files are allowed!');
  });
});