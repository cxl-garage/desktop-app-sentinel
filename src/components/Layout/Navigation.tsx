import { NavLink } from 'react-router-dom';
import './Layout.css';
import runmodel from '../../../assets/runmodel.png';
import logs from '../../../assets/logs.png';
import selected from '../../../assets/selected.png';
import setup from '../../../assets/setup.png';

export function Navigation(): JSX.Element {
  return (
    <div className="navigation-container">
      <div className="links-container">
        <NavLink
          to="/run-model"
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <img className="selected-img" alt="selected" src={selected} />
          <img className="id" alt="runmodel" src={runmodel} />
          Run your model
        </NavLink>

        <NavLink
          to="/logs"
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <img className="selected-img" alt="selected" src={selected} />
          <img className="id" alt="logs" src={logs} />
          Logs
        </NavLink>

        <NavLink
          to="/past-results"
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <img className="selected-img" alt="selected" src={selected} />
          <img className="id" alt="runmodel" src={runmodel} />
          Past results
        </NavLink>

        <NavLink
          to="/more-models"
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <img className="selected-img" alt="selected" src={selected} />
          <img className="id" alt="runmodel" src={runmodel} />
          More models
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <img className="selected-img" alt="selected" src={selected} />
          <img className="id" alt="setup" src={setup} />
          Settings
        </NavLink>
      </div>
    </div>
  );
}
