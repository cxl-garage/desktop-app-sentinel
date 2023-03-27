import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Layout, theme } from 'antd';
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
import { ModelMarketplaceView } from 'components/ModelMarketplaceView';
import { SettingsView } from 'components/SettingsView';
import { AfterOrgInput } from 'pages-DEPRECATED/afterorg';
import { Sidebar } from 'components/Layout/Sidebar';
import { Navbar } from 'components/Layout/Navbar';

const QUERY_CLIENT = new QueryClient();
const { Header, Sider, Content } = Layout;

const THEME: ThemeConfig = {
  token: {
    colorPrimary: '#00aaff',
    colorTextHeading: '#656565',
  },
  components: {
    Layout: {
      colorBgHeader: '#fafafa',
    },
  },
};

const { defaultAlgorithm, darkAlgorithm } = theme;

/**
 * Main app component with all the routes.
 */
export default function App(): JSX.Element {
  const [darkMode, setDarkMode] = React.useState(false);
  const themeToUse = React.useMemo(
    () => ({
      ...THEME,
      algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
    }),
    [darkMode],
  );

  return (
    <ConfigProvider theme={themeToUse}>
      <QueryClientProvider client={QUERY_CLIENT}>
        <div className="App">
          <Router>
            <Layout>
              <Header>
                <Navbar setDarkMode={setDarkMode} />
              </Header>
              <Layout>
                <Sider>
                  <Sidebar />
                </Sider>
                <Content>
                  <Routes>
                    <Route path="/" element={<Navigate to="/run-model" />} />
                    <Route path="/run-model" element={<RunModelView />} />
                    <Route path="/logs" element={<LogsView />} />
                    <Route path="/past-results" element={<PastResultsView />} />
                    <Route
                      path="/more-models"
                      element={<ModelMarketplaceView />}
                    />
                    <Route path="/settings" element={<SettingsView />} />
                    {/* TODO: this is a legacy route. Is it still needed? */}
                    <Route path="/orgsubmitted" element={<AfterOrgInput />} />
                  </Routes>
                </Content>
              </Layout>
            </Layout>
          </Router>
        </div>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
