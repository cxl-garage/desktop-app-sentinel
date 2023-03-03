import './css/dashboard.css';
import docker from '../../assets/docker.png';

// open window from browser
export function Setup(): JSX.Element {
  const handleClick = (): void => {
    window.electron.OpenWindow(
      'https://www.docker.com/products/docker-desktop/',
    );
  };

  return (
    <>
      <h1>Setup</h1>
      <div className="setup">
        <p>
          Click below to download docker desktop for your computer, open it, and
          sign in!
        </p>
        <button type="button" onClick={handleClick}>
          <img
            src={docker}
            className="setup-img"
            height="100"
            width="400"
            alt="Download docker desktop"
          />
        </button>
      </div>
    </>
  );
}
