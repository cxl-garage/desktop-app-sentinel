import '../renderer/App.css';
import '../pages/css/dashboard.css';
import './css/components.css';
import icon from '../../assets/icon.png';
import information from '../../assets/information.png';

export function Navbar(): JSX.Element {
  return (
    <div className="d-flex flex-row bd-highlight mb-3 logged-in-navbar">
      <img alt="" src={icon} width="20" height="20" className="nav-bar-icon" />
      <img
        alt="Information"
        className="info-icon"
        height="20"
        width="20"
        src={information}
      />
    </div>
  );
}
