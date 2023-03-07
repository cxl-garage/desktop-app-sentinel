import * as React from 'react';
import '../renderer/App.css';
import './css/dashboard.css';
import { LogComponent } from '../components/LogComponent';

export function Logs(): JSX.Element {
  const [logs, setLogs] = React.useState([]);

  // read log file (see main.ts for function definition)
  // setLogs is setting logs from data of reading file in ipcMain
  React.useEffect(() => {
    async function readLogFile(): Promise<void> {
      console.log('calling read log file');
      console.log(window);
      console.log(window.electron);
      const data = await window.electron.ReadLogFile();
      setLogs(data);
    }

    readLogFile();
  }, []);

  return (
    <>
      <h1>Logs</h1>
      <div className="logs-div">
        <LogComponent data={logs} />
      </div>
      <button type="button" className="start-button">
        Contact support
      </button>
    </>
  );
}
