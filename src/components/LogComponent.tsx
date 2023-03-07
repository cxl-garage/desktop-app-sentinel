import '../renderer/App.css';
import './css/components.css';
import log from '../../assets/log.svg';

type Props = {
  data: string[] | null | undefined;
};

export function LogComponent({ data }: Props): JSX.Element {
  return (
    <div className="log">
      <img src={log} alt="log" />
      <p>{data}</p>
    </div>
  );
}
