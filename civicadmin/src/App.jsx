// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Issues from './pages/Issues/Issues';
import IssueDetail from './pages/IssueDetail/IssueDetail';
import Officers from './pages/Officers/Officers';
import Inventory from './pages/Inventory/Inventory';
import Analytics from './pages/Analytics/Analytics';
import FullScreenMap from './pages/Map/FullScreenMap';
import FlaggedIssues from './pages/FlaggedIssues/FlaggedIssues';

// Create a simple ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    // return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues"
        element={
          <ProtectedRoute>
            <Layout>
              <Issues />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <IssueDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/officers"
        element={
          <ProtectedRoute>
            <Layout>
              <Officers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/flagged-issues" element={<ProtectedRoute>
            <Layout>
              <FlaggedIssues />
            </Layout>
          </ProtectedRoute>} />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Layout>
              <Inventory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <Layout>
              <FullScreenMap />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Redirect to login if not authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;