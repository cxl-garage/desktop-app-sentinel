import './css/dashboard.css';
import docker from '../../assets/docker.png';

//open window from browser
const Setup = () =>  {
    const handleClick= async () => {
     await window.electron.OpenWindow("https://www.docker.com/products/docker-desktop/");
    }

    return (
      <>
        <h1>Setup</h1>
        <div className='setup'>
        <p>Click below to download docker desktop for your computer, open it, and sign in!</p>
          <img
          src={docker}
          className='setup-img'
          height='100'
          width='400'
          alt="docker image"
          onClick={handleClick}
          />
        </div>
      </>
    );
}

export default Setup;
