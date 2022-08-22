
import { FunctionComponent } from 'react';
import '../renderer/App.css';
import '../pages/css/dashboard.css';
import './css/components.css';
import icon from '../../assets/icon.png';
import information from '../../assets/information.png';

type LoggedinNavBarProps = {
  email: string | null | undefined;
  username: string | null | undefined;
  logOut: Function;
};

const LoggedInNavBar: FunctionComponent<LoggedinNavBarProps> = ({
  email,
  username,
  logOut,
}) => (
  <div className="d-flex flex-row bd-highlight mb-3 logged-in-navbar">
    <img src={icon} width="20" height="20" className="nav-bar-icon" />
    <button className="profile-button">welcome {username===null ? email : username}</button>
    <img className="info-icon" height="20" width="20" src={information} />
    <button className="sign-out-button" onClick={() => logOut()}>
      log out
    </button>
  </div>
);

export { LoggedInNavBar };
