import * as React from 'react';
import '../renderer/App.css';
import './css/results.css';

export function Results(): JSX.Element {
  const [imageCount, setImageCount] = React.useState('');
  const [emptyCount, setEmptyCount] = React.useState('');
  const [objects, setObjects] = React.useState('');

  // read results written by the python script
  // get imagecount, emptyimages, and objects info from py/Results.json
  React.useEffect(() => {
    async function readResults(): Promise<void> {
      const data = await window.electron.ReadResults();
      const array = JSON.parse(data);
      setImageCount(array[0].imagecount);
      setEmptyCount(array[0].emptyimages);
      setObjects(array[0].objects);
    }
    readResults();
  }, []);

  return (
    <>
      <h1>Results</h1>
      <div className="results">
        <p className="title">Summary</p>
        <div className="summary-grid">
          <div className="obj1">
            <p>Processed images:</p>
            <span>{imageCount}</span>
          </div>
          <div className="obj">
            <p>Empty images:</p>
            <div className="percent">
              {((Number(emptyCount) / Number(imageCount)) * 100).toFixed(2)} %
            </div>
            <span>{emptyCount}</span>
          </div>
          <div className="obj">
            <p>Number of objects found:</p>
            <div className="percent">
              {((Number(objects) / Number(imageCount)) * 100).toFixed(2)} %
            </div>
            <span>{objects}</span>
          </div>
        </div>
      </div>
    </>
  );
}
