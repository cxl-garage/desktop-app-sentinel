import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css';
import { LogsView } from '../components/LogsView';
import { Results } from '../pages/results';
import { Setup } from '../pages/setup';
import { RunModelView } from '../components/RunModelView';
import { Layout } from '../components/Layout';
import { AfterOrgInput } from '../pages/afterorg';

/**
 * All the routes
 */
export default function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/run-model" />} />
        <Route
          path="/run-model"
          element={
            <Layout>
              <RunModelView />
            </Layout>
          }
        />

        <Route
          path="/logs"
          element={
            <Layout>
              <LogsView />
            </Layout>
          }
        />

        <Route
          path="/past-results"
          element={
            <Layout>
              <Results />
            </Layout>
          }
        />

        <Route
          path="/more-models"
          element={
            <Layout>
              <Setup />
            </Layout>
          }
        />

        <Route
          path="/settings"
          element={
            <Layout>
              <Setup />
            </Layout>
          }
        />

        {/* TODO: this is a legacy route. Is it still needed? */}
        <Route
          path="/orgsubmitted"
          element={
            <Layout>
              <AfterOrgInput />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
