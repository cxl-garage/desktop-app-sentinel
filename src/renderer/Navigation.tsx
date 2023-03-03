import { NavLink } from 'react-router-dom';
import './Layout.css';
import runmodel from '../../assets/runmodel.png';
import profile from '../../assets/profile.png';
import logs from '../../assets/logs.png';
import selected from '../../assets/selected.png';
import setup from '../../assets/setup.png';

export function Navigation(): JSX.Element {
  return (
    <div className="NavigationContainer">
      <div className="LinksContainer">
        <NavLink
          to="/dashboard" // navigate to each page using routes defined in App.tsx
          // if active, uses class active, if not, uses inactive
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <img className="selected-img" alt="selected" src={selected} />
          Run your model <img className="id" alt="runmodel" src={runmodel} />
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <img className="selected-img" alt="selected" src={selected} />
          Profile <img className="id" alt="profile" src={profile} />
        </NavLink>
        <NavLink
          to="/logs"
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <img className="selected-img" alt="selected" src={selected} />
          Logs <img className="id" alt="logs" src={logs} />
        </NavLink>
        <NavLink
          to="/setup"
          className={({ isActive }) => (isActive ? 'active' : 'inactive')}
        >
          <img className="selected-img" alt="selected" src={selected} />
          Setup <img className="id" alt="setup" src={setup} />
        </NavLink>
      </div>
    </div>
  );
}
