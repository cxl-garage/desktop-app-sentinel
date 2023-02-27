import { useState } from 'react';
import '../renderer/App.css';
import { useNavigate } from 'react-router-dom';
import './css/dashboard.css';
import organization from '../../assets/organization.svg';
import ReactLoading from 'react-loading';

const Dashboard = () => {
  const [org, setOrg] = useState(null); //set organization inputed by user
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  //setOrg to event's target value
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrg(event.target.value);
  };

  //run python script to populate models for the given org
  const runFindOrgModels = async () => {
    try {
      const response = await window.electron.FindOrgModels(org);
      return response;
    } catch (e) {
      return e;
    }
  };

  let python_response = '';
  //sendOrg is triggered when you hit the start button
  const sendOrg = async (e: any) => {
    e.preventDefault();
    if (org === null) {
      alert('Input organization please');
    } else {
      setIsLoading(true);
      const response = await runFindOrgModels();
      python_response = response;
      setIsLoading(false);
      //if any of the following responses are returned it means the script ran successfully
      if (
        String(python_response).includes('success') ||
        String(python_response).includes('Login succeeded') ||
        String(python_response).includes('available models')
      ) { //navigate to afterOrg.tsx page, send Org to next page
        navigate('/orgsubmitted', {
          state: { organization: org },
        });
      } else {
        alert(
          `ERROR: check docker is running and signed in, also check organization spelling ${options}`
        );
        await navigate('/dashboard');
        setOrg(null);
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <div className='is-loading'>
          <h1>Loading models for your org...</h1>
          <br />
          <ReactLoading className='loading' type='spin' color='#21CF05' height={100} width={100} />
        </div>
      ) : (
        <>
          <h1>Model Notebook</h1>
          <form className="model-notebook-container-dashboard">
            <div className="model-notebook-labels-container">
              <div className="vl" />
              <div className="labels">
                <img src={organization} height="40" width="40" />
                <label htmlFor="Organization">Organization</label>
              </div>
            </div>
            <div className="model-notebook-inputs-dashboard">
              <input
                name="Organization"
                className='input-dashboard'
                id="Organization"
                type="text"
                onChange={onChange}
                required
              />
            </div>
          </form>
          <button className="start-button" onClick={sendOrg}>
              Next
          </button>
        </>
      )}
    </>
  );
};

export { Dashboard };
