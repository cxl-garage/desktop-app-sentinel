import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { Menu, Space } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import runmodel from '../../../assets/runmodel.png';
import logs from '../../../assets/logs.png';
import setup from '../../../assets/setup.png';

export function Sidebar(): JSX.Element {
  const navigate = useNavigate();

  return (
    <Menu
      onClick={(menuInfo: MenuInfo) => {
        const url = `/${menuInfo.key}`;
        navigate(url);
      }}
      items={[
        {
          key: 'run-model',
          label: (
            <Space>
              <img
                className="Sidebar__img Sidebar__id"
                alt="runmodel"
                src={runmodel}
              />
              Run your model
            </Space>
          ),
        },
        {
          key: 'logs',
          label: (
            <Space>
              <img className="Sidebar__img Sidebar__id" alt="logs" src={logs} />
              Logs
            </Space>
          ),
        },
        {
          key: 'past-results',
          label: (
            <Space>
              <img
                className="Sidebar__img Sidebar__id"
                alt="runmodel"
                src={runmodel}
              />
              Past results
            </Space>
          ),
        },
        {
          key: 'more-models',
          label: (
            <Space>
              <img
                className="Sidebar__img Sidebar__id"
                alt="runmodel"
                src={runmodel}
              />
              More models
            </Space>
          ),
        },
        {
          key: 'settings',
          label: (
            <Space>
              <img
                className="Sidebar__img Sidebar__id"
                alt="setup"
                src={setup}
              />
              Settings
            </Space>
          ),
        },
      ]}
    />
  );
}
