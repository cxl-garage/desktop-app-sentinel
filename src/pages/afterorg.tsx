
import { useState, useRef, useEffect } from 'react';
import '../renderer/App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import importfrom from '../../assets/importfrom.svg';
import model from '../../assets/model.svg';
import saveto from '../../assets/saveto.svg';
import confidencethreshold from '../../assets/confidencethreshold.svg';
import outputstyle from '../../assets/outputstyle.svg';
import ReactLoading from 'react-loading';
const AfterOrgInput = (initialState = {}) => {
  const [values, setValues] = useState(initialState); //values of all user inputs below
  const [models, setModels] = useState([]); //model options used by this organization
  const [Model, setModel] = useState(''); //model set by user
  const [isLoading, setIsLoading] = useState(false); //loading state, triggered after pressing submit button
  const [firstRender, setFirstRender] = useState(false); //populate organization's models in firstRender

  const url = useLocation();
  const Organization = url.state.organization; //organization given from last page, dashboard.tsx

  const navigate = useNavigate();

  //useRef to map fileImport and fileExport to custom choose file buttons
  //input file can't be styled
  const hiddenFileImport = useRef(null);
  const hiddenFileExport = useRef(null);

  const handleClickImport = () => {
    hiddenFileImport.current.click();
  }
  const handleClickExport = () => {
    hiddenFileExport.current.click();
  }

  //selects folder with images users want to apply model to
  //uses main process of finding folder
  //setInput value to the file path to the folder
  //setting values
  const logInput = async ()=> {
    try {
      const response = await window.electron.SelectInputFolder();
      setValues({ ...values, ['Import from']: response });
      return response;
   } catch(e) {
      alert(e);
   }
  }

  //selects folder that results will be downloaded to
  //sets values and output folder state
  const logOutput = async ()=> {
    try {
      const response = await window.electron.SelectOutputFolder();
      setValues({ ...values, ['Save to']: response });
      return response;
   } catch(e) {
      alert(e);
   }
  }

  //setting values state
  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setValues({ ...values, [event.target.name]: event.target.value });
  };
  //setting chosen model state
  const modelChange = (event: any) => {
    setModel(event.target.value);
    setValues({ ...values, ['Model']: event.target.value, ['Organization']: Organization });
  };

  //uses ref to choose folders
  const onInputClick = async (event: any) => {
    event.preventDefault();
    await logInput();
  }
  const onOutputClick = async (event: any) => {
    event.preventDefault();
    await logOutput();
  }
 //reads the models from Models.json and turns the models into an array
 //populates model list on first render
  const populateModels = () => {window.electron.ReadModels()
  .then((data:any) => {
      const array=JSON.parse(data);
      setModels(array[0]['models']);
    });}

  useEffect(populateModels, [firstRender]);

  const modelList = models.map((m: any) => (
    <option value={m}>{m}</option>
  ));

  //RunModel: runs python script of the specified model from userInput.json
  //async function to await the backend function
  const runModel = async () => {
    try {
      const model_results = await window.electron.RunModel();
      return model_results;
    } catch (e) {
      return e;
    }
  };

  let python_response = '';
  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (Model === 'Choose model') {
      alert('Input model please');
    } else {
      setIsLoading(true); //loading the results of running the python script
      window.electron.WriteUserInputJson(JSON.stringify(values)); //populate Inputs.json with user inputs from this page
      const model_results = await runModel(); //the results of running the model, if prints finished it means it ran correctly
      python_response = model_results; //results of python shell running
      setIsLoading(false);
      if (
        String(python_response).includes('finished') ||
        String(python_response).includes('sentinel')
      ) {
        navigate('/results'); //navigate to results page
      } else {
        alert(
          `ERROR: check logs: ${python_response}` //if there are errors, alert
        );
        await navigate('/dashboard'); //navigate to dashboard
      }
    }
  };
  return (
    <>
      {isLoading ? (
         <div className='is-loading'>
          <h1>Loading results...</h1>
          {/* <Loading totalImages='11' /> */}
          <br />
          <ReactLoading className='loading' type='spin' color='#21CF05' height={100} width={100} />
       </div>
      ) : (
      <>
        <h1>Model Notebook</h1>
        <form className="model-notebook-container">
          <div className="model-notebook-labels-container">
            <div className="vl" />
            <div className="labels">
              <img src={model} height="40" width="40" />
              <label htmlFor="Model">Models</label>
            </div>
            <div className="labels">
              <img src={importfrom} />
              <label htmlFor="Importfrom">Import from</label>
            </div>
            <div className="labels">
              <img src={saveto} />
              <label htmlFor="Saveto">Save to</label>
            </div>
            <div className="labels">
              <img src={confidencethreshold} height="40" width="40" />
              <label htmlFor="Confidencethreshold">Confidence threshold</label>
            </div>
            <div className="labels">
              <img src={outputstyle} height="40" width="40" />
              <label htmlFor="Outputstyle">Output style</label>
            </div>
          </div>
          <div className="model-notebook-inputs-container">
            <input
              name="Model"
              id="Model"
              type="text"
              value={values['Model']}
              placeholder="Choose model"
              required
            />
            <input
              name="Import from"
              id="Importfrom"
              type="text"
              value={values['Import from']}
              placeholder="Import from folder"
            />
            <input
              name="Save to"
              id="Saveto"
              type="text"
              value={values['Save to']}
              placeholder="Save to folder"
            />
            <input
              name="Confidence threshold"
              id="Confidencethreshold"
              type="range"
              defaultValue={40}
              onChange={onChange}
              required
            />
            <input
              name="Output style"
              id="Outputstyle"
              type="text"
              value={values['Outputstyle']}
              placeholder="Output style"
            />
          </div>
          <div className="model-container-buttons">
            <select
              className = "model-select"
              id = "Model"
              name = "Model"
              onClick = {modelChange}
              required
            >
              {modelList}
            </select>
            <button className='model-select' onClick={handleClickImport}>Choose folder</button>
            <input
              name="Import from"
              id="Importfrom"
              type="file"
              ref={hiddenFileImport}
              placeholder="Select folder"
              directory="" //allows you to select directory instead of file
              webkitdirectory=""
              style={{display: 'none'}}
              onClick={onInputClick}
              required
            />
            <button className='model-select' onClick={handleClickExport}>Choose folder</button>
            <input
              name="Save to"
              id="Saveto"
              type="file"
              ref={hiddenFileExport}
              placeholder="Select folder"
              multiple=""
              directory=""
              webkitdirectory=""
              style={{display: 'none'}}
              onClick={onOutputClick}
              required
            />
            <input
              type="number"
              className="confidence-thresh-button"
              value={values['Confidence threshold']===undefined ? 40 : values['Confidence threshold'] }
            />
            <select
              className="output-style-select"
              id="Output style"
              name="Outputstyle"
              onChange={onChange}
              defaultValue='none'
            >
              <option value="none">None</option>
              <option value="flat">Flat</option>
              <option value="hierachy">Hierarchy</option>
              <option value="class">Class</option>
            </select>
          </div>
        </form>
        <button className="start-button" onClick={onSubmit}>
          Start
        </button>
      </>)}
    </>
  );
};

export {AfterOrgInput};
