import icon from '../../assets/icon.png';
import './css/components.css';

const LoggedOutNavBar = () => {
  return (
    <nav className="align-top navbar-signed-out">
      <img src={icon} alt="upper-icon" width="20" />
      <span>Conservation X Labs</span>
    </nav>
  );
};

export {LoggedOutNavBar}
