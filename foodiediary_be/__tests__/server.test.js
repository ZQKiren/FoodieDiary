const originalEnv = process.env;

// Mock dependencies before requiring the module
const mockListen = jest.fn((port, callback) => {
  if (callback) callback();
  return { on: jest.fn() };
});

const mockUse = jest.fn();
const mockJson = jest.fn().mockReturnValue('json middleware');

const mockExpress = jest.fn().mockReturnValue({
  use: mockUse,
  listen: mockListen
});
mockExpress.json = mockJson;

jest.mock('express', () => mockExpress);
jest.mock('cors', () => jest.fn().mockReturnValue('cors middleware'));
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockReturnValue('prisma client')
}));

jest.mock('../routes/authRoutes', () => 'auth routes');
jest.mock('../routes/postRoutes', () => 'post routes');
jest.mock('../routes/adminRoutes', () => 'admin routes');
jest.mock('../routes/bookmarkRoutes', () => 'bookmark routes');

// Mock console.log and console.error to avoid test output clutter
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock process.exit to prevent tests from exiting
jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Server', () => {
  beforeEach(() => {
    // Reset mocks and modules before each test
    jest.clearAllMocks();
    jest.resetModules();
    
    // Set environment variables
    process.env = { ...originalEnv, PORT: '4000' };
  });
  
  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });
  
  test('initializes express app with middleware', () => {
    // Require the server module to trigger initialization
    require('../server');
    
    // Check Express initialization
    expect(mockExpress).toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalled();
    expect(mockUse).toHaveBeenCalledWith('cors middleware');
    expect(mockUse).toHaveBeenCalledWith('json middleware');
  });
  
  test('sets up routes', () => {
    // Require the server module
    require('../server');
    
    // Check routes setup
    expect(mockUse).toHaveBeenCalledWith('/api/auth', 'auth routes');
    expect(mockUse).toHaveBeenCalledWith('/api/posts', 'post routes');
    expect(mockUse).toHaveBeenCalledWith('/api/admin', 'admin routes');
    expect(mockUse).toHaveBeenCalledWith('/api/bookmarks', 'bookmark routes');
  });
  
  test('sets up error handler middleware', () => {
    // Require the server module
    require('../server');
    
    // Find error handler middleware (function with 4 parameters)
    const errorHandlerCalls = mockUse.mock.calls.filter(
      call => call.length === 1 && typeof call[0] === 'function'
    );
    
    expect(errorHandlerCalls.length).toBeGreaterThan(0);
    
    // Test the error handler
    const errorHandler = errorHandlerCalls[0][0];
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();
    const mockError = { stack: 'Error stack' };
    
    // Call the error handler
    errorHandler(mockError, mockReq, mockRes, mockNext);
    
    // Verify error handler behavior
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Something went wrong!' });
  });
  
  test('starts server on specified port', () => {
    // Require the server module
    require('../server');
    
    // Verify server startup
    expect(mockListen).toHaveBeenCalledWith('4000', expect.any(Function));
  });
  
  test('sets up unhandled rejection handler', () => {
    // Get listeners before requiring server
    const originalListeners = process.listeners('unhandledRejection');
    
    // Require the server module
    require('../server');
    
    // Expect a new listener to be added
    expect(process.listeners('unhandledRejection').length).toBeGreaterThan(originalListeners.length);
  });
});