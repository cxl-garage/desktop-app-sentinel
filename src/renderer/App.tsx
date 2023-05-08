import * as React from 'react';
import { StyleProvider } from '@ant-design/cssinjs';
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
import { PastResultsAllPictures } from 'components/PastResultsView/PastResultsAllPictures';

const QUERY_CLIENT = new QueryClient();
const { Header, Sider, Content } = Layout;

const LIGHT_BG_COLOR = '#fafafa';
const DARK_BG_COLOR = '#35393f';
const PRIMARY_COLOR = '#00aaff';
const WHITE = '#ffffff';

const LIGHT_THEME: ThemeConfig = {
  token: {
    colorPrimary: PRIMARY_COLOR,
    colorTextHeading: '#656565',
    colorBgBase: LIGHT_BG_COLOR,
    colorBgContainer: LIGHT_BG_COLOR,
    colorBgLayout: LIGHT_BG_COLOR,
  },
  components: {
    Layout: {
      colorBgHeader: LIGHT_BG_COLOR,
    },
  },
};

const DARK_THEME: ThemeConfig = {
  token: {
    colorPrimary: PRIMARY_COLOR,
    colorTextHeading: WHITE,
    colorBgBase: DARK_BG_COLOR,
    colorBgContainer: DARK_BG_COLOR,
    colorBgLayout: DARK_BG_COLOR,
  },
  components: {
    Layout: {
      colorBgHeader: DARK_BG_COLOR,
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
      ...(darkMode ? DARK_THEME : LIGHT_THEME),
      algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
    }),
    [darkMode],
  );

  return (
    <ConfigProvider theme={themeToUse}>
      <StyleProvider hashPriority="high">
        <QueryClientProvider client={QUERY_CLIENT}>
          <div className={`App${darkMode ? ' dark' : ''}`}>
            <Router>
              <Layout className="h-full overflow-auto">
                <Sider>
                  <Sidebar />
                </Sider>
                <Layout>
                  <Header className="border-b-2 border-gray-200 dark:border-gray-600">
                    <Navbar setDarkMode={setDarkMode} />
                  </Header>
                  <Content>
                    <Routes>
                      <Route path="/" element={<Navigate to="/run-model" />} />
                      <Route path="/run-model" element={<RunModelView />} />
                      <Route path="/logs" element={<LogsView />} />
                      <Route path="/past-results">
                        <Route index element={<PastResultsView />} />
                        <Route
                          path=":resultsPath"
                          element={<PastResultsAllPictures />}
                        />
                      </Route>
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
      </StyleProvider>
    </ConfigProvider>
  );
}
