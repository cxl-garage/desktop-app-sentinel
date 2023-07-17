import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import SplitPane from '@roothub/react-split-pane';
import { Button, Tooltip } from 'antd';
import React, { useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { CollapsedSidebar } from './CollapsedSidebar';
import { Sidebar } from './Sidebar';
import ThemeSwitch from './ThemeSwitch';

const DEFAULT_EXPANDED_SIDEBAR_WIDTH = 240;
const COLLAPSED_SIDEBAR_WIDTH = 50;

interface IProps {
  children: React.ReactNode;
  onChangeDarkMode: (darkMode: boolean) => void;
}

function AppFrameWithSidebar({
  children,
  onChangeDarkMode,
}: IProps): JSX.Element {
  const [isSidebarExpanded, setIsSidebarOpen] = useLocalStorageState<boolean>(
    'isSidebarExpanded',
    { defaultValue: true },
  );
  const [sidebarWidth, setSidebarWidth] = useState<number>(
    isSidebarExpanded
      ? DEFAULT_EXPANDED_SIDEBAR_WIDTH
      : COLLAPSED_SIDEBAR_WIDTH,
  );
  return (
    <SplitPane
      split="vertical"
      size={sidebarWidth}
      maxSize={1000}
      onChange={(newSize) => {
        if (newSize <= COLLAPSED_SIDEBAR_WIDTH) {
          setSidebarWidth(COLLAPSED_SIDEBAR_WIDTH);
          setIsSidebarOpen(false);
        } else {
          setSidebarWidth(newSize);
          setIsSidebarOpen(true);
        }
      }}
    >
      <div className="relative flex h-full min-h-screen flex-col overflow-y-auto">
        {isSidebarExpanded ? (
          <div className="w-full flex-1">
            <Sidebar />
          </div>
        ) : (
          <button
            type="button"
            className="flex w-full flex-1 cursor-pointer items-center"
            onClick={(event) => {
              event.preventDefault();
              setIsSidebarOpen(true);
              setSidebarWidth(DEFAULT_EXPANDED_SIDEBAR_WIDTH);
            }}
          >
            <CollapsedSidebar />
          </button>
        )}
        <div className="fixed bottom-4 left-3 flex flex-col">
          {isSidebarExpanded && (
            <div className="mb-4 ml-2">
              <ThemeSwitch onChangeDarkMode={onChangeDarkMode} />
            </div>
          )}
          <Tooltip
            title={isSidebarExpanded ? undefined : 'Expand sidebar'}
            placement="right"
          >
            <Button
              type="text"
              size="small"
              icon={
                isSidebarExpanded ? (
                  <span className="mr-2">
                    <DoubleLeftOutlined />
                  </span>
                ) : (
                  <DoubleRightOutlined />
                )
              }
              onClick={() => {
                if (isSidebarExpanded) {
                  setIsSidebarOpen(false);
                  setSidebarWidth(COLLAPSED_SIDEBAR_WIDTH);
                } else {
                  setIsSidebarOpen(true);
                  setSidebarWidth(DEFAULT_EXPANDED_SIDEBAR_WIDTH);
                }
              }}
            >
              {isSidebarExpanded ? 'Collapse sidebar' : null}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="h-full min-h-screen w-full flex-1 overflow-y-auto">
        {children}
      </div>
    </SplitPane>
  );
}

export default AppFrameWithSidebar;
