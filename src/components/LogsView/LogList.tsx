import * as React from 'react';
import { DateTime } from 'luxon';
import { Table, TablePaginationConfig } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import useLocalStorageState from 'use-local-storage-state';
import { formatInteger } from '../RunModelView/utils/commonUtils';
import * as LogRecord from '../../models/LogRecord';
import LogContents from './LogContents';

const DEFAULT_PAGE_SIZE = 10;

type Props = {
  logs?: LogRecord.T[];
};

const columns: ColumnsType<LogRecord.T> = [
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
  const [pageSize, setPageSize] = useLocalStorageState<number>(
    'logListPageSize',
    { defaultValue: DEFAULT_PAGE_SIZE },
  );

  const handleChange = (pagination: TablePaginationConfig): void => {
    if (pagination.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const renderExpandedRow = React.useCallback((logRecord: LogRecord.T) => {
    return <LogContents logRecord={logRecord} />;
  }, []);

  return (
    <Table
      columns={columns}
      dataSource={logs}
      rowKey="modelRunId"
      onChange={handleChange}
      pagination={{
        pageSize,
        showSizeChanger: true,
        pageSizeOptions: ['10', '25', '50', '100'],
        hideOnSinglePage: true,
        showTotal: (total, range) =>
          `${formatInteger(range[0])}-${formatInteger(
            range[1],
          )} of ${formatInteger(total)} entries`,
      }}
      bordered
      expandable={{
        expandedRowRender: renderExpandedRow,

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
