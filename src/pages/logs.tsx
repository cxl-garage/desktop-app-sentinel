import { useState } from 'react';
import '../renderer/App.css';
import './css/dashboard.css';
import {LogComponent} from '../components/logComponent';


export default function Logs() {
  const [logs, setLogs]=useState([]);
  //read log file (see main.ts for function definition)
  //setLogs is setting logs from data of reading file in ipcMain

  window.electron.ReadLogFile()
        .then((data:any) => {
            setLogs(data);
          });
  return (
    <>
        <h1>Logs</h1>
        <div className="logs-div">
          <LogComponent data={logs} />
        </div>
        <button className="start-button">Contact support</button>
    </>

  )
}
export { Logs };

