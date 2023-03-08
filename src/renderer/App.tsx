import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css';
import { PastResultsView } from 'components/PastResultsView';
import { LogsView } from 'components/LogsView';
import { RunModelView } from 'components/RunModelView';
import { Layout } from 'components/Layout';
import { ModelMarketplaceView } from 'components/ModelMarketplaceView';
import { SettingsView } from 'components/SettingsView';
import { AfterOrgInput } from '../pages/afterorg';

const QUERY_CLIENT = new QueryClient();

/**
 * Main app component with all the routes.
 */
export default function App(): JSX.Element {
  return (
    <div className="App">
      <QueryClientProvider client={QUERY_CLIENT}>
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
                  <PastResultsView />
                </Layout>
              }
            />

            <Route
              path="/more-models"
              element={
                <Layout>
                  <ModelMarketplaceView />
                </Layout>
              }
            />

            <Route
              path="/settings"
              element={
                <Layout>
                  <SettingsView />
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
      </QueryClientProvider>
    </div>
  );
}
