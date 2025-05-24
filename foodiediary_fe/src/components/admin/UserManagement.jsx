import { useState, useEffect } from 'react';
import adminService from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const ResponsiveUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');
  
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      showToast('User role updated successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast('Failed to update user role', 'error');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteUser(userToDelete.id);
      showToast('User deleted successfully', 'success');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Failed to delete user', 'error');
    }
  };

  const renderMobileUserCard = (user) => {
    const isCurrentUser = user.id === currentUser.id;
    
    return (
      <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center text-green-800 text-lg font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </h3>
              {isCurrentUser && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  You
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-500 truncate mt-1">
              {user.email}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {user.postCount} posts
              </span>
              
              <div className="flex items-center space-x-2">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={isCurrentUser}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                
                <button
                  onClick={() => handleDeleteClick(user)}
                  disabled={isCurrentUser}
                  className="text-xs text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabletUserRow = (user) => {
    const isCurrentUser = user.id === currentUser.id;
    
    return (
      <tr key={user.id} className="hover:bg-gray-50">
        <td className="px-4 py-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                <span className="truncate max-w-[120px]">{user.name}</span>
                {isCurrentUser && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    You
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 truncate max-w-[150px]">
                {user.email}
              </div>
            </div>
          </div>
        </td>
        
        <td className="px-4 py-3 text-sm text-gray-900">
          {user.postCount}
        </td>
        
        <td className="px-4 py-3">
          <select
            value={user.role}
            onChange={(e) => handleRoleChange(user.id, e.target.value)}
            disabled={isCurrentUser}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </td>
        
        <td className="px-4 py-3 text-right">
          <button
            onClick={() => handleDeleteClick(user)}
            disabled={isCurrentUser}
            className="text-sm text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  };

  const renderDesktopTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUser.id;
              
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center text-green-800">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                          <span>{user.name}</span>
                          {isCurrentUser && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.postCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isCurrentUser}
                      className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteClick(user)}
                      disabled={isCurrentUser}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsersList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">No users are currently registered in the system.</p>
        </div>
      );
    }

    switch (screenSize) {
      case 'mobile':
        return (
          <div className="space-y-4">
            {users.map(renderMobileUserCard)}
          </div>
        );
      
      case 'tablet':
        return (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posts
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(renderTabletUserRow)}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'desktop':
      default:
        return renderDesktopTable();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">
          Manage users and their roles
        </p>
        {screenSize !== 'desktop' && (
          <p className="text-sm text-gray-500 mt-1">
            Viewing {users.length} users in {screenSize} layout
          </p>
        )}
      </div>

      {renderUsersList()}

      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowDeleteModal(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${
              screenSize === 'mobile' ? 'sm:max-w-sm' : 'sm:max-w-lg'
            } sm:w-full`}>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Delete User
                    </h3>
                    <div className="mt-2">
                      <p className={`${screenSize === 'mobile' ? 'text-sm' : 'text-sm'} text-gray-500`}>
                        Are you sure you want to delete{' '}
                        <span className="font-medium">
                          {userToDelete?.name || userToDelete?.email}
                        </span>
                        ? This action cannot be undone, and all posts by this
                        user will also be deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  data-testid="confirm-delete-button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto ${
                    screenSize === 'mobile' ? 'text-sm' : 'sm:text-sm'
                  }`}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto ${
                    screenSize === 'mobile' ? 'text-sm' : 'sm:text-sm'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveUsersManagement;