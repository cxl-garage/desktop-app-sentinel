import './Navbar.css';
import { Row, Col, Switch } from 'antd';
import icon from '../../../assets/icon.png';

type Props = {
  setDarkMode: (darkMode: boolean) => void;
};

export function Navbar({ setDarkMode }: Props): JSX.Element {
  return (
    <div className="Navbar">
      <Row>
        <Col>
          <img
            alt=""
            src={icon}
            width="20"
            height="20"
            className="Navbar__info-icon"
          />
        </Col>
        <Col flex="auto" />
        <Col>
          <Switch onChange={(checked, _) => setDarkMode(checked)} />
        </Col>
      </Row>
    </div>
  );
}
