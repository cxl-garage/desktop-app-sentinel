/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/alt-text */
import { useState } from 'react';
import '../renderer/App.css';
import { useLocation } from 'react-router-dom';
import './css/results.css';

const Results = () => {
  const [imageCount, setImageCount]=useState('');
  const [emptyCount, setEmptyCount]=useState('');
  const [objects, setObjects]=useState('');

  //read results written by the python script
  //get imagecount, emptyimages, and objects info from py/Results.json
  window.electron.ReadResults()
        .then((data:any) => {
            const array=JSON.parse(data);
            setImageCount(array[0]['imagecount']);
            setEmptyCount(array[0]['emptyimages'])
            setObjects(array[0]['objects']);
        });

  return (
    <>
      <h1>Results</h1>
      <div className='results'>
        <p className='title'>Summary</p>
        <div className='summary-grid'>
          <div className='obj1'>
            <p>Processed images:</p>
            <span>{imageCount}</span>
          </div>
          <div className='obj'>
            <p>Empty images:</p>
            <div className='percent'>{(Number(emptyCount)/Number(imageCount)*100).toFixed(2)} %</div>
            <span>{emptyCount}</span>
          </div>
          <div className='obj'>
            <p>Number of objects found:</p>
            <div className='percent'>{(Number(objects)/Number(imageCount)*100).toFixed(2)} %</div>
            <span>{objects}</span>
          </div>
        </div>
      </div>
    </>)
};

export {Results};
