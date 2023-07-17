import {
  CodepenOutlined,
  LineChartOutlined,
  ProfileOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Divider, Layout, Menu, Row, Space } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import icon from '../../../assets/icon.png';

export function Sidebar(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Layout className="h-full">
      <Row className="mt-6 justify-center">
        <img
          alt=""
          src={icon}
          width="100"
          height="100"
          className="Navbar__cxl-icon"
        />
      </Row>
      <Divider />
      <Row>
        <Menu
          style={{ borderRight: 0, width: '100%' }}
          selectedKeys={[location.pathname.split('/')[1]]}
          onClick={(menuInfo: MenuInfo) => {
            const url = `/${menuInfo.key}`;
            navigate(url);
          }}
          items={[
            {
              key: 'run-model',
              label: (
                <Space>
                  <CodepenOutlined />
                  Run your model
                </Space>
              ),
            },
            {
              key: 'logs',
              label: (
                <Space>
                  <ProfileOutlined />
                  Logs
                </Space>
              ),
            },
            {
              key: 'past-results',
              label: (
                <Space>
                  <LineChartOutlined />
                  Past results
                </Space>
              ),
            },
            {
              key: 'more-models',
              label: (
                <Space>
                  <ShoppingCartOutlined />
                  More models
                </Space>
              ),
            },
            {
              key: 'settings',
              label: (
                <Space>
                  <SettingOutlined />
                  Settings
                </Space>
              ),
            },
          ]}
        />
      </Row>
    </Layout>
  );
}
