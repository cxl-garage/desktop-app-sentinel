/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/alt-text */
import { FunctionComponent } from 'react';
import '../renderer/App.css';
import './css/components.css';
import log from '../../assets/log.svg';


type LogComponentProps = {
  data: Array<String> | null | undefined;
};

const LogComponent: FunctionComponent<LogComponentProps> = ({data}) => {
  return (
  <div className="log">
    <img src={log} alt="log" />
    <p>{data}</p>
  </div>
)};

export { LogComponent };
