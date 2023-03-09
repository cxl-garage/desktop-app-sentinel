import './Navbar.css';
import icon from '../../../assets/icon.png';
import information from '../../../assets/information.png';

export function Navbar(): JSX.Element {
  return (
    <div className="Navbar">
      <img
        alt=""
        src={icon}
        width="20"
        height="20"
        className="Navbar__cxl-icon"
      />
      <img
        alt="Information"
        className="Navbar__info-icon"
        height="20"
        width="20"
        src={information}
      />
    </div>
  );
}
