import { Col, Row, Switch } from 'antd';
import './Navbar.css';

type Props = {
  setDarkMode: (darkMode: boolean) => void;
};

export function Navbar({ setDarkMode }: Props): JSX.Element {
  return (
    <div>
      <Row>
        <Col flex="auto" />
        <Col>
          <Switch onChange={(checked, _) => setDarkMode(checked)} />
        </Col>
      </Row>
    </div>
  );
}
