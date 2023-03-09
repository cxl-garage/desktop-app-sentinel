import './SettingsView.css';
import docker from '../../../assets/docker.png';

export function SettingsView(): JSX.Element {
  const handleClick = (): void => {
    window.SentinelDesktopService.openWindow(
      'https://www.docker.com/products/docker-desktop/',
    );
  };

  return (
    <>
      <h1>Setup</h1>
      <div className="SettingsView">
        <p className="SettingsView__p">
          Click below to download docker desktop for your computer, open it, and
          sign in!
        </p>
        <button type="button" onClick={handleClick}>
          <img
            src={docker}
            className="SettingsView__docker-img"
            height="100"
            width="400"
            alt="Download docker desktop"
          />
        </button>
      </div>
    </>
  );
}
