import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useContext } from 'react';
// eslint-disable-next-line import/no-unresolved
import { AuthContext } from '../context/AuthContext';
import { AuthProvider } from '../provider/authProvider';
import Layout from './Layout';
import { Dashboard } from '../pages/dashboard';
import { AfterOrgInput } from '../pages/afterorg';
import { Logs } from '../pages/logs';
import Login from '../pages/login';
import { Profile } from 'pages/profile';
import { Results } from 'pages/results';
import Setup from 'pages/setup';

//all the routes, add layout which has nav bar to all app's pages except login
export default function App() {
  const user = useContext(AuthContext);

  return (

    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Login />
            }
          />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/results"
            element={
              <Layout>
                <Results />
              </Layout>
            }
          />
          <Route
            path="/orgsubmitted"
            element={
              <Layout>
                <AfterOrgInput />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                 <Profile user={user.currentUser} email={user.currentUser?.email} username={user.currentUser?.displayName} />
              </Layout>
            }
          />
          <Route
            path="/setup"
            element={
              <Layout>
                <Setup />
              </Layout>
            }
          />
          <Route
            path="/logs"
            element={
              <Layout>
                <Logs />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
