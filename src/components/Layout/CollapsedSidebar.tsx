import {
  CodepenOutlined,
  LineChartOutlined,
  ProfileOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Space, Tooltip } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import icon from '../../../assets/icon.png';
import './Sidebar.css';

export function CollapsedSidebar(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Layout className="h-full pt-4">
      <div className="grid place-content-center">
        <img
          alt=""
          src={icon}
          width="36"
          height="36"
          className="Navbar__cxl-icon"
        />
      </div>
      <div className="mt-4">
        <Menu
          style={{ borderRight: 0, width: '100%' }}
          selectedKeys={[location.pathname.split('/')[1]]}
          onClick={(menuInfo: MenuInfo) => {
            const url = `/${menuInfo.key}`;
            menuInfo.domEvent.preventDefault();
            menuInfo.domEvent.stopPropagation();
            navigate(url);
          }}
          items={[
            {
              key: 'run-model',
              label: (
                <Tooltip title="Run your model" placement="right">
                  <Space>
                    <CodepenOutlined />
                  </Space>
                </Tooltip>
              ),
            },
            {
              key: 'logs',
              label: (
                <Tooltip title="Logs" placement="right">
                  <Space>
                    <ProfileOutlined />
                  </Space>
                </Tooltip>
              ),
            },
            {
              key: 'past-results',
              label: (
                <Tooltip title="Past results" placement="right">
                  <Space>
                    <LineChartOutlined />
                  </Space>
                </Tooltip>
              ),
            },
            {
              key: 'more-models',
              label: (
                <Tooltip title="More models" placement="right">
                  <Space>
                    <ShoppingCartOutlined />
                  </Space>
                </Tooltip>
              ),
            },
            {
              key: 'settings',
              label: (
                <Tooltip title="Settings" placement="right">
                  <Space>
                    <SettingOutlined />
                  </Space>
                </Tooltip>
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
