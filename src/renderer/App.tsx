import { StyleProvider } from '@ant-design/cssinjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ThemeConfig } from 'antd';
import { ConfigProvider, Layout, theme } from 'antd';
import { LogsView } from 'components/LogsView';
import { ModelMarketplaceView } from 'components/ModelMarketplaceView';
import { PastResultsView } from 'components/PastResultsView';
import { PastResultsAllPictures } from 'components/PastResultsView/PastResultsAllPictures';
import { RunModelView } from 'components/RunModelView';
import { SettingsView } from 'components/SettingsView';
import { AfterOrgInput } from 'pages-DEPRECATED/afterorg';
import * as React from 'react';
import {
  MemoryRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import useLocalStorageState from 'use-local-storage-state';
import AppFrameWithSidebar from '../components/Layout/AppFrameWithSidebar';
import './App.css';

const QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

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
  const [isDarkMode, setIsDarkMode] = useLocalStorageState<boolean>(
    'isDarkMode',
    { defaultValue: false },
  );
  const themeToUse = React.useMemo(
    () => ({
      ...(isDarkMode ? DARK_THEME : LIGHT_THEME),
      algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
    }),
    [isDarkMode],
  );

  return (
    <ConfigProvider theme={themeToUse}>
      <StyleProvider hashPriority="high">
        <QueryClientProvider client={QUERY_CLIENT}>
          <div className={`App${isDarkMode ? ' dark' : ''}`}>
            <Router>
              <AppFrameWithSidebar onChangeDarkMode={setIsDarkMode}>
                <Layout className="h-full min-h-screen overflow-auto">
                  <Routes>
                    <Route path="/" element={<Navigate to="/run-model" />} />
                    <Route path="/run-model" element={<RunModelView />} />
                    <Route path="/logs" element={<LogsView />} />
                    <Route path="/past-results">
                      <Route index element={<PastResultsView />} />
                      <Route
                        path=":modelId"
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
                </Layout>
              </AppFrameWithSidebar>
            </Router>
          </div>
        </QueryClientProvider>
      </StyleProvider>
    </ConfigProvider>
  );
}
