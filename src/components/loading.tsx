import { FunctionComponent, useEffect, useState } from 'react';
import '../renderer/App.css';
import './css/components.css';


type Loading = {
  totalImages: string;
};

const Loading: FunctionComponent<Loading> = ({totalImages}) => {
  const [percentage, setPercentage] = useState('');
  const [imageCount, setImageCount] = useState('');
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(seconds => seconds + 1);
    }, 1000);
    window.electron.ReadUpdate()
      .then((data:any) => {
        // const array=JSON.parse(data);
          //setImageCount(array[0]['imagecount']);
          setPercentage(data);
      })
    return () => clearInterval(interval);
  }, []);

  return (
  <div className="loading">
    <p>{percentage}</p>
  </div>
)};


export { Loading };
