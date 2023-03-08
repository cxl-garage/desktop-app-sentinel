import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import runmodel from '../../../assets/runmodel.png';
import logs from '../../../assets/logs.png';
import selected from '../../../assets/selected.png';
import setup from '../../../assets/setup.png';

export function Sidebar(): JSX.Element {
  return (
    <div className="Sidebar">
      <div className="Sidebar__links-container">
        <NavLink
          to="/run-model"
          className={({ isActive }) =>
            isActive ? 'Sidebar__active' : 'Sidebar__inactive'
          }
        >
          <img
            className="Sidebar__img Sidebar__selected-img"
            alt="selected"
            src={selected}
          />
          <img
            className="Sidebar__img Sidebar__id"
            alt="runmodel"
            src={runmodel}
          />
          Run your model
        </NavLink>

        <NavLink
          to="/logs"
          className={({ isActive }) =>
            isActive ? 'Sidebar__active' : 'Sidebar__inactive'
          }
        >
          <img
            className="Sidebar__img Sidebar__selected-img"
            alt="selected"
            src={selected}
          />
          <img className="Sidebar__img Sidebar__id" alt="logs" src={logs} />
          Logs
        </NavLink>

        <NavLink
          to="/past-results"
          className={({ isActive }) =>
            isActive ? 'Sidebar__active' : 'Sidebar__inactive'
          }
        >
          <img
            className="Sidebar__img Sidebar__selected-img"
            alt="selected"
            src={selected}
          />
          <img
            className="Sidebar__img Sidebar__id"
            alt="runmodel"
            src={runmodel}
          />
          Past results
        </NavLink>

        <NavLink
          to="/more-models"
          className={({ isActive }) =>
            isActive ? 'Sidebar__active' : 'Sidebar__inactive'
          }
        >
          <img
            className="Sidebar__img Sidebar__selected-img"
            alt="selected"
            src={selected}
          />
          <img
            className="Sidebar__img Sidebar__id"
            alt="runmodel"
            src={runmodel}
          />
          More models
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? 'Sidebar__active' : 'Sidebar__inactive'
          }
        >
          <img
            className="Sidebar__img Sidebar__selected-img"
            alt="selected"
            src={selected}
          />
          <img className="Sidebar__img Sidebar__id" alt="setup" src={setup} />
          Settings
        </NavLink>
      </div>
    </div>
  );
}
