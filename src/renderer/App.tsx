import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
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
    colorBgContainer: '#fafafa',
  },
};

const { defaultAlgorithm, darkAlgorithm } = theme;

/**
 * Main app component with all the routes.
 */
export default function App(): JSX.Element {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ConfigProvider
      theme={{
        ...THEME,
        algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <QueryClientProvider client={QUERY_CLIENT}>
        <div className="App">
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/run-model" />} />
              <Route
                path="/run-model"
                element={
                  <Layout setDarkMode={setDarkMode}>
                    <RunModelView />
                  </Layout>
                }
              />

              <Route
                path="/logs"
                element={
                  <Layout setDarkMode={setDarkMode}>
                    <LogsView />
                  </Layout>
                }
              />

              <Route
                path="/past-results"
                element={
                  <Layout setDarkMode={setDarkMode}>
                    <PastResultsView />
                  </Layout>
                }
              />

              <Route
                path="/more-models"
                element={
                  <Layout setDarkMode={setDarkMode}>
                    <ModelMarketplaceView />
                  </Layout>
                }
              />

              <Route
                path="/settings"
                element={
                  <Layout setDarkMode={setDarkMode}>
                    <SettingsView />
                  </Layout>
                }
              />

              {/* TODO: this is a legacy route. Is it still needed? */}
              <Route
                path="/orgsubmitted"
                element={
                  <Layout setDarkMode={setDarkMode}>
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
