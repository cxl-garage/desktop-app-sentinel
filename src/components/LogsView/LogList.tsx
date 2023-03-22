import './LogList.css';
import * as LogRecord from 'models/LogRecord';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  StopFilled,
  WarningFilled,
  InfoCircleFilled,
  PlusCircleFilled,
  RightOutlined,
  DownOutlined,
} from '@ant-design/icons';
import assertUnreachable from '../../util/assertUnreachable';

type Props = {
  logs?: LogRecord.T[];
};

const levelIcons = (level: LogRecord.LogLevel): JSX.Element => {
  switch (level) {
    case 'ERROR':
      return <StopFilled />;
    case 'WARNING':
      return <WarningFilled />;
    case 'INFO':
      return <InfoCircleFilled />;
    case 'DEBUG':
      return <PlusCircleFilled />;
    default:
      assertUnreachable(level, { throwError: false });
      return <div />;
  }
};

const columns: ColumnsType<LogRecord.T> = [
  {
    title: '',
    key: 'level',
    dataIndex: 'level',
    width: '1%',
    render: (level: LogRecord.LogLevel) => {
      return <Tooltip title={level}>{levelIcons(level)}</Tooltip>;
    },
  },
  {
    title: 'Timestamp',
    key: 'timestamp',
    dataIndex: 'timestamp',
    width: '25%',
    render: (timestamp: Date) => timestamp.toISOString(),
  },
  {
    title: '',
    key: 'message',
    dataIndex: 'message',
  },
];

export function LogList({ logs = [] }: Props): JSX.Element {
  return (
    <Table
      columns={columns}
      dataSource={logs}
      rowKey="id"
      pagination={false}
      expandable={{
        expandedRowRender: (row) => row.message,
        // Potential future refactor to eliminate eslint error, however,
        // expandIcon follows the recommendation from antd
        // eslint-disable-next-line react/no-unstable-nested-components
        expandIcon: ({ expanded, onExpand, record }) =>
          expanded ? (
            <DownOutlined onClick={(e) => onExpand(record, e)} />
          ) : (
            <RightOutlined onClick={(e) => onExpand(record, e)} />
          ),
        rowExpandable: () => true,
      }}
    />
  );
}
