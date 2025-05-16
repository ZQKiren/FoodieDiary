const originalEnv = process.env;

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

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    process.env = { ...originalEnv, PORT: '4000' };
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });
  
  test('initializes express app with middleware', () => {
    require('../server');
    
    expect(mockExpress).toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalled();
    expect(mockUse).toHaveBeenCalledWith('cors middleware');
    expect(mockUse).toHaveBeenCalledWith('json middleware');
  });
  
  test('sets up routes', () => {
    require('../server');
    
    expect(mockUse).toHaveBeenCalledWith('/api/auth', 'auth routes');
    expect(mockUse).toHaveBeenCalledWith('/api/posts', 'post routes');
    expect(mockUse).toHaveBeenCalledWith('/api/admin', 'admin routes');
    expect(mockUse).toHaveBeenCalledWith('/api/bookmarks', 'bookmark routes');
  });
  
  test('sets up error handler middleware', () => {
    require('../server');
    
    const errorHandlerCalls = mockUse.mock.calls.filter(
      call => call.length === 1 && typeof call[0] === 'function'
    );
    
    expect(errorHandlerCalls.length).toBeGreaterThan(0);
    
    const errorHandler = errorHandlerCalls[0][0];
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();
    const mockError = { stack: 'Error stack' };
    
    errorHandler(mockError, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Something went wrong!' });
  });
  
  test('starts server on specified port', () => {
    require('../server');
    
    expect(mockListen).toHaveBeenCalledWith('4000', expect.any(Function));
  });
  
  test('sets up unhandled rejection handler', () => {
    const originalListeners = process.listeners('unhandledRejection');
    
    require('../server');
    
    expect(process.listeners('unhandledRejection').length).toBeGreaterThan(originalListeners.length);
  });
});