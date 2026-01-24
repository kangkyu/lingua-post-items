import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Feed from '@/pages/Feed';
import Books from '@/pages/Books';
import Share from '@/pages/Share';
import Profile from '@/pages/Profile';
import Bookmarks from '@/pages/Bookmarks';
import CreateBook from '@/pages/CreateBook';
import BookDetail from '@/pages/BookDetail';
import AuthCallback from '@/pages/AuthCallback';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth callback route without layout */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Main app routes with layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/books" element={<Books />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/share" element={<Share />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/create-book" element={<CreateBook />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
