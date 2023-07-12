import './LogList.css';
import { DateTime } from 'luxon';
import * as LogRecord from 'models/LogRecord';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  StopFilled,
  WarningFilled,
  CheckCircleFilled,
  RightOutlined,
  DownOutlined,
} from '@ant-design/icons';
import assertUnreachable from '../../util/assertUnreachable';

type Props = {
  logs?: LogRecord.T[];
};

const levelIcons = (level: LogRecord.LogResultType): JSX.Element => {
  switch (level) {
    case 'ERROR':
      return <StopFilled className="text-red-600" />;
    case 'WARNING':
      return <WarningFilled className="text-oragen-500" />;
    case 'SUCCESS':
      return (
        <CheckCircleFilled className="rounded-full text-blue-500 ring-2 ring-blue-300" />
      );
    default:
      assertUnreachable(level, { throwError: false });
      return <div />;
  }
};

const columns: ColumnsType<LogRecord.T> = [
  {
    title: '',
    key: 'logResult',
    dataIndex: 'logResult',
    width: '1%',
    render: (level: LogRecord.LogResultType) => {
      return <Tooltip title={level}>{levelIcons(level)}</Tooltip>;
    },
  },
  {
    title: 'Date',
    key: 'timestamp',
    dataIndex: 'timestamp',
    width: '25%',
    render: (timestamp: Date) =>
      DateTime.fromJSDate(timestamp).toFormat('MMMM d, yyyy | HH:MM:ss'),
  },
  {
    title: 'Model',
    key: 'modelName',
    dataIndex: 'modelName',
  },
  {
    title: 'Output Folder',
    key: 'outputPath',
    dataIndex: 'outputPath',
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
        expandedRowRender: (logRecord: LogRecord.T) =>
          `This is where we would show the logs for ${logRecord.modelName}`,
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
