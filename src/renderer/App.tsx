import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
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
import { AfterOrgInput } from 'pages-DEPRECATED/afterorg';

const QUERY_CLIENT = new QueryClient();

const THEME: ThemeConfig = {
  token: {
    colorPrimary: '#00aaff',
    colorTextHeading: '#656565',
  },
};

/**
 * Main app component with all the routes.
 */
export default function App(): JSX.Element {
  return (
    <ConfigProvider theme={THEME}>
      <QueryClientProvider client={QUERY_CLIENT}>
        <div className="App">
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
        </div>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
