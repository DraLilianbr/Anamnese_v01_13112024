import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { Home } from './pages/home';
import { Assessment } from './pages/assessment';
import { Dashboard } from './pages/dashboard';
import { ResponsesView } from './pages/responses';
import { NotFound } from './pages/not-found';
import { Login } from './pages/login';
import { useAuth } from './lib/auth';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/assessment/:id" element={<Assessment />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/responses/:responseId"
            element={
              <PrivateRoute>
                <ResponsesView />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}