import * as React from 'react';
import '../renderer/App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import ReactLoading from 'react-loading';
import importfrom from '../../assets/importfrom.svg';
import model from '../../assets/model.svg';
import saveto from '../../assets/saveto.svg';
import confidencethreshold from '../../assets/confidencethreshold.svg';
import outputstyle from '../../assets/outputstyle.svg';

export function AfterOrgInput(): JSX.Element {
  const [values, setValues] = React.useState<Record<string, string>>({}); // values of all user inputs below
  const [models, setModels] = React.useState([]); // model options used by this organization
  const [Model, setModel] = React.useState(''); // model set by user
  const [isLoading, setIsLoading] = React.useState(false); // loading state, triggered after pressing submit button
  const [firstRender] = React.useState(false); // populate organization's models in firstRender

  const url = useLocation();
  const Organization = url.state.organization; // organization given from last page, dashboard.tsx

  const navigate = useNavigate();

  // useRef to map fileImport and fileExport to custom choose file buttons
  // input file can't be styled
  const hiddenFileImport = React.useRef<HTMLInputElement | null>(null);
  const hiddenFileExport = React.useRef<HTMLInputElement | null>(null);

  const handleClickImport = (): void => {
    hiddenFileImport.current?.click();
  };
  const handleClickExport = (): void => {
    hiddenFileExport.current?.click();
  };

  // selects folder with images users want to apply model to
  // uses main process of finding folder
  // setInput value to the file path to the folder
  // setting values
  const logInput = async (): Promise<void> => {
    try {
      const response = await window.electron.SelectInputFolder();
      setValues({ ...values, 'Import from': response });
    } catch (e) {
      alert(e);
    }
  };

  // selects folder that results will be downloaded to
  // sets values and output folder state
  const logOutput = async (): Promise<void> => {
    try {
      const response = await window.electron.SelectOutputFolder();
      setValues({ ...values, 'Save to': response });
    } catch (e) {
      alert(e);
    }
  };

  // setting values state
  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    event.preventDefault();
    setValues((prevValues) => ({
      ...prevValues,
      [event.target.name]: event.target.value,
    }));
  };

  // setting chosen model state
  const onModelChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setModel(event.target.value);
    setValues({
      ...values,
      Model: event.target.value,
      Organization,
    });
  };

  // uses ref to choose folders
  const onInputClick = (event: React.MouseEvent<HTMLInputElement>): void => {
    event.preventDefault();
    logInput();
  };
  const onOutputClick = (event: React.MouseEvent<HTMLInputElement>): void => {
    event.preventDefault();
    logOutput();
  };

  const modelList = models.map((m: any) => <option value={m}>{m}</option>);

  // RunModel: runs python script of the specified model from userInput.json
  // async function to await the backend function
  const runModel = async (): Promise<any> => {
    const modelResults = await window.electron.RunModel();
    return modelResults;
  };

  let pythonResponse = '';
  const onSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (Model === 'Choose model') {
      alert('Input model please');
    } else {
      setIsLoading(true); // loading the results of running the python script
      window.electron.WriteUserInputJson(JSON.stringify(values)); // populate Inputs.json with user inputs from this page
      const modelResults = await runModel(); // the results of running the model, if prints finished it means it ran correctly
      pythonResponse = modelResults; // results of python shell running
      setIsLoading(false);
      if (
        String(pythonResponse).includes('finished') ||
        String(pythonResponse).includes('sentinel')
      ) {
        navigate('/results'); // navigate to results page
      } else {
        alert(
          `ERROR: check logs: ${pythonResponse}`, // if there are errors, alert
        );
        navigate('/dashboard'); // navigate to dashboard
      }
    }
  };

  React.useEffect(() => {
    // reads the models from Models.json and turns the models into an array
    // populates model list on first render
    const populateModels = async (): Promise<void> => {
      const data = await window.electron.ReadModels();
      const array = JSON.parse(data);
      setModels(array[0].models);
    };

    populateModels();
  }, [firstRender]);

  return isLoading ? (
    <div className="is-loading">
      <h1>Loading results...</h1>
      <br />
      <ReactLoading
        className="loading"
        type="spin"
        color="#21CF05"
        height={100}
        width={100}
      />
    </div>
  ) : (
    <>
      <h1>Model Notebook</h1>
      <form className="model-notebook-container">
        <div className="model-notebook-labels-container">
          <div className="vl" />
          <div className="labels">
            <img alt="" src={model} height="40" width="40" />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="Model">Models</label>
          </div>
          <div className="labels">
            <img alt="" src={importfrom} />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="Importfrom">Import from</label>
          </div>
          <div className="labels">
            <img alt="" src={saveto} />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="Saveto">Save to</label>
          </div>
          <div className="labels">
            <img alt="" src={confidencethreshold} height="40" width="40" />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="Confidencethreshold">Confidence threshold</label>
          </div>
          <div className="labels">
            <img alt="" src={outputstyle} height="40" width="40" />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="Outputstyle">Output style</label>
          </div>
        </div>
        <div className="model-notebook-inputs-container">
          <input
            name="Model"
            id="Model"
            type="text"
            value={values.Model}
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
            value={values.Outputstyle}
            placeholder="Output style"
          />
        </div>
        <div className="model-container-buttons">
          <select
            className="model-select"
            id="Model"
            name="Model"
            onChange={onModelChange}
            required
          >
            {modelList}
          </select>
          <button
            type="button"
            className="model-select"
            onClick={handleClickImport}
          >
            Choose folder
          </button>
          <input
            name="Import from"
            id="Importfrom"
            type="file"
            ref={hiddenFileImport}
            placeholder="Select folder"
            /* eslint-disable react/no-unknown-property,@typescript-eslint/ban-ts-comment */
            // @ts-ignore
            directory="" // allows you to select directory instead of file
            webkitdirectory=""
            /* eslint-enable */
            style={{ display: 'none' }}
            onClick={onInputClick}
            required
          />
          <button
            type="button"
            className="model-select"
            onClick={handleClickExport}
          >
            Choose folder
          </button>
          <input
            name="Save to"
            id="Saveto"
            type="file"
            ref={hiddenFileExport}
            placeholder="Select folder"
            multiple
            /* eslint-disable react/no-unknown-property,@typescript-eslint/ban-ts-comment */
            // @ts-ignore
            webkitdirectory=""
            directory=""
            /* eslint-enable */
            style={{ display: 'none' }}
            onClick={onOutputClick}
            required
          />
          <input
            type="number"
            className="confidence-thresh-button"
            value={
              values['Confidence threshold'] === undefined
                ? 40
                : values['Confidence threshold']
            }
          />
          <select
            className="output-style-select"
            id="Output style"
            name="Outputstyle"
            onChange={onChange}
            defaultValue="none"
          >
            <option value="none">None</option>
            <option value="flat">Flat</option>
            <option value="hierachy">Hierarchy</option>
            <option value="class">Class</option>
          </select>
        </div>
      </form>
      <button type="button" className="start-button" onClick={onSubmit}>
        Start
      </button>
    </>
  );
}
