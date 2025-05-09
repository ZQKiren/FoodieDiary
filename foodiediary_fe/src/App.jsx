import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';

import Login from './pages/Login';
import Register from './pages/Register';

import Home from './pages/Home';
import MyPosts from './pages/MyPosts';
import NewPost from './pages/NewPost';
import EditPost from './pages/EditPost';
import ViewPost from './pages/ViewPost';

import AdminDashboard from './pages/admin/AdminDashboard';
import PostsManagement from './pages/admin/PostsManagement';
import UsersManagement from './pages/admin/UsersManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/my-posts" element={<MyPosts />} />
                <Route path="/new-post" element={<NewPost />} />
                <Route path="/edit-post/:id" element={<EditPost />} />
                <Route path="/posts/:id" element={<ViewPost />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="posts" element={<PostsManagement />} />
                  <Route path="users" element={<UsersManagement />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;