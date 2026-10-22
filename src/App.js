import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import './App.css';

// Auth 관련
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/Auth/LoginPage';

// 페이지 컴포넌트들
import RootRedirect from './components/routing/RootRedirect';
import { BlogList, BlogPost, PostsShell } from './pages/Blog';
import About from './pages/About';

import PostManager from './pages/Admin/PostManager';

function AppContent() {
  useEffect(() => {
    // OAuth 리다이렉트 후 세션 확인
    const checkOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      
      if (accessToken || refreshToken) {

      }
    };
    
    checkOAuthRedirect();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        {/* 글 목록과 글 상세는 사이드바를 공유하는 틀 안에서 이동한다 (사이드바가 새로 그려지지 않게) */}
        <Route element={<PostsShell />}>
          <Route path="/posts" element={<BlogList />} />
          <Route path="/posts/:id" element={<BlogPost />} />
        </Route>
        <Route path="/about" element={<About />} />

        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin/posts" 
          element={
            <ProtectedRoute>
              <PostManager />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router basename={process.env.PUBLIC_URL || '/'}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
