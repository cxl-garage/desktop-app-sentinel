import * as React from 'react';
import '../renderer/App.css';
import { useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import ReactLoading from 'react-loading';
import organization from '../../assets/organization.svg';

export function Dashboard(): JSX.Element {
  const [org, setOrg] = React.useState<string | null>(null); // set organization inputed by user
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  // setOrg to event's target value
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setOrg(event.target.value);
  };

  // run python script to populate models for the given org
  const runFindOrgModels = async (): Promise<any> => {
    try {
      const response = await window.electron.FindOrgModels(org);
      return response;
    } catch (e) {
      return e;
    }
  };

  let pythonResponse = '';
  // sendOrg is triggered when you hit the start button
  const sendOrg = async (e: any): Promise<void> => {
    e.preventDefault();
    if (org === null) {
      alert('Input organization please');
    } else {
      setIsLoading(true);
      const response = await runFindOrgModels();
      pythonResponse = response;
      setIsLoading(false);
      // if any of the following responses are returned it means the script ran successfully
      if (
        String(pythonResponse).includes('success') ||
        String(pythonResponse).includes('Login succeeded') ||
        String(pythonResponse).includes('available models')
      ) {
        // navigate to afterOrg.tsx page, send Org to next page
        navigate('/orgsubmitted', {
          state: { organization: org },
        });
      } else {
        alert(
          'ERROR: check docker is running and signed in, also check organization spelling',
        );
        navigate('/dashboard');
        setOrg(null);
      }
    }
  };

  return isLoading ? (
    <div className="is-loading">
      <h1>Loading models for your org...</h1>
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
      <form className="model-notebook-container-dashboard">
        <div className="model-notebook-labels-container">
          <div className="vl" />
          <div className="labels">
            <img alt="" src={organization} height="40" width="40" />
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label htmlFor="Organization">Organization</label>
          </div>
        </div>
        <div className="model-notebook-inputs-dashboard">
          <input
            name="Organization"
            className="input-dashboard"
            id="Organization"
            type="text"
            onChange={onChange}
            required
          />
        </div>
      </form>
      <button type="button" className="start-button" onClick={sendOrg}>
        Next
      </button>
    </>
  );
}
