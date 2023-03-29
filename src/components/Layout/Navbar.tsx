import './Navbar.css';
import { Row, Col, Switch } from 'antd';
import icon from '../../../assets/icon.png';

type Props = {
  setDarkMode: (darkMode: boolean) => void;
};

export function Navbar({ setDarkMode }: Props): JSX.Element {
  return (
    <div>
      <Row>
        <Col>
          <img
            alt=""
            src={icon}
            width="50"
            height="50"
            className="Navbar__cxl-icon"
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
