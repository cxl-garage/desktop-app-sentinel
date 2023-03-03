import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css';
import { Results } from 'pages/results';
import { Setup } from 'pages/setup';
import { Layout } from './Layout';
import { Dashboard } from '../pages/dashboard';
import { AfterOrgInput } from '../pages/afterorg';
import { Logs } from '../pages/logs';

/**
 * All the routes
 */
export default function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
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
  );
}
