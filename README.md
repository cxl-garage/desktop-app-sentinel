# desktop-app-cxl

**This Desktop App was built using [Electron React Boilerplate](https://electron-react-boilerplate.js.org/) and [Python Shell](https://www.npmjs.com/package/python-shell)**. Uses [Sentinel-Cli](https://github.com/cxl-garage/sentinel-cli) python code. **Only works on Windows**. You also must download and sign in to [Docker Desktop](https://www.docker.com/products/docker-desktop/) to successfully run CXL ML models.

## Pre-requisites

Python version `3.10.2`

## Local setup

1. After cloning and going into repo, run `yarn install`
2. To start the app, run `yarn start`

## Helpful Resources for Electron Inter-Process Communication

**Used this to communicate between main processes and renderer (frontend)**
![ipcresponserequest](https://user-images.githubusercontent.com/59401357/185219866-92dd5e7f-f735-4d0c-bc6e-49d2a14c72f5.png)

- [Electron IPC](https://codex.so/electron-ipc)
- [Typescript Electron IPC Response/Request](https://blog.logrocket.com/electron-ipc-response-request-architecture-with-typescript/)

## Higher Level App Structure

Overview: the ML models are run through a python script that starts a docker container locally.

**Most important folders and files in desktop-app-cxl**

```mermaid
graph TD;
    desktop-app-cxl-->islandconservation.json;
    desktop-app-cxl-->package.json;
    desktop-app-cxl-->src;
    desktop-app-cxl-->assets;
    desktop-app-cxl-->node_modules
    src-->components
    src-->context
    src-->main
    src-->pages
    src-->provider
    src-->py
    src-->renderer
    src-->routes
    assets-->icons/images
    main-->main.ts
    main-->preload.ts
    provider-->authProvider.tsx
    provider-->firebaseSetup.ts
    renderer-->index.ejs
    renderer-->App.tsx
    renderer-->Layout.tsx
    py-->runCli2.py
    py-->runOrg.py
```

## Detailed Description of Structure:

### src/main/

**Summary: contains all the key process codes and related modules, reads, writes files and runs python-shell**

- preload.ts: install python requirements, use [contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge)
  - functions use channel to communicate from **renderer** process to **main** process
  - send **message to main process**
  - electron api functions
    - \*\*overview: functions run pythonshell, write files locally, read files locally, open browser window, and select local directories"

```
const WINDOW_API = {
 FindOrgModels: async (arg: any) => ipcRenderer.invoke('run/find-org-models', arg), //runs python shell with inputted org
 RunModel: async (arg: any) => ipcRenderer.invoke('run/model', arg), //runs all user inputs and outputs results of user inputted model
 WriteUserInputJson: async (arg: any)=> ipcRenderer.send('write/user-inputs-json', arg), //writes file of user input data from afterorg.tsx
 SelectInputFolder: async ()=> ipcRenderer.invoke('dialog:openDirectoryInput'), //allows to select directory for input folder of user's images
 SelectOutputFolder: async ()=> ipcRenderer.invoke('dialog:openDirectoryOutput'), //allows to select directory for output folder of the model results of user's images
 ReadLogFile: async () => ipcRenderer.invoke('read/log-file'), //read local logFile inside the app
 ReadUpdate: async () => ipcRenderer.invoke('read/update-file'), //read update.json file
 ReadResults: async () => ipcRenderer.invoke('read/results-file'), //read Results.json which has the number of objects, empty images, and the total images that the model was run over
 ReadModels: async () => ipcRenderer.invoke('read/models-file'), //read Models populated by runOrg.py for the inputed organization
 OpenWindow: async (arg: any)=> ipcRenderer.send('open/window', arg), //open new window of docker.desktop
 CountFiles: async (arg: any) => ipcRenderer.invoke('count/files', arg), //count the total number of local files
};

//exposes window api to renderer
contextBridge.exposeInMainWorld('electron', WINDOW_API);
```

- main.ts: [ipcMain](https://www.electronjs.org/docs/latest/api/ipc-main) processes
  - recieve messages from **renderer process** and **return value**
- **python-shell usage in main.ts**

```python

ipcMain.handle('run/model', async (event, args) => {
  const result = await new Promise((resolve, reject) => {
    const pyshell = new PythonShell('./src/py/runCli2.py', {mode: 'text'});
    let error = '';
    pyshell.on('stderr', function (stderr: any) {
      console.log(stderr);
    });
    pyshell.on('error', function (err: any) {
      if (err) {
        error = err;
        resolve(`error${err}`);
      }
      console.log(err);
    });
    pyshell.on('message', function (message: any) {
      resolve(error + message);
      console.log(message);
    });

    pyshell.end(function (err: any, code: any, signal: any) {
      if (err) reject(`error${err}`);
      console.log(`The exit code was: ${code}`);
      console.log(`The exit signal was: ${signal}`);
      console.log('finished');
      resolve('finished');
    });
  });

  return result;
});
```

### src/provider/

**Summary: Firebase auth info**

- authProvider.tsx: gives Firebase currentUser information to its children
- firebaseSetup.ts: configures **[Firebase](https://firebase.google.com/docs/auth/web/manage-users)** information and exports auth object

### src/context/

**Summary: [React createContext](https://reactjs.org/docs/context.html) for the current firebaseUser**

- authContext.tsx: uses firebase/auth node module

### src/renderer/

**Summary: UI related code and modules come under the renderer process folder**

- **\*App.tsx: has all the routes, and uses AuthProvider and AuthContext to get current **Firebase User**\***
  - passes down user from authContext
- preload.d.ts: declares window as global variable, which communicates with _ipcRenderer_
  - [Inter-Process Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
- Layout.tsx: applies Layout to all children if signed in; if not signed in, navigate to **login.tsx**
  - imports Navigation.tsx
- Navigation.tsx: Side-nav bar to different routes
- index.tsx and index.ejs
  - renders App from root

### src/py

- **\*runCli2.py**: main python script, uses user info to start docker container with inputted images\*
- **\*runOrg.py**: gets available models for given organization\*
- inputData.json: user inputs from afterorg.tsx page
- logfile.csv: logs most recent python script
- Models.json: models from inputed org
- progress.csv: for getting loading info but never got it to work
- readFile.py: read file code
- reqs.py: install reqs needed to run python script
- Results.json: results from main python script of images, empty number, and objects found
- utils.py: reused functions, used in main python scripts

### src/pages

**Contains different pages to navigate to**

- css folder
- dashboard.tsx: contains entry for putting in your org, runs first python script that populates models, on submit goes to afterorg.tsx
- afterorg.tsx: populates model dropdown
  - input output style, where to save images on computer, where to get the images on computer, confidence threshhold
  - writes user inputs to file
  - runs full docker container/model on images you inputed
  - on submit goes to results.tsx
- results.tsx: result of models
- profile.tsx: some profile info
- logs.tsx: python logs
- setup: download docker container from link

### src/components/

**Summary: reused components**

- logComponent.tsx
  - type: FunctionComponent
  - takes in data (log info & array) as props
  - returns formatted log component
- loggedInNavBar.tsx
  - type: FunctionComponent
  - takes in user info and Firebase logout function as props
  - when user is logged in
- loggedOutNavbar
  - type: FunctionComponent
  - when user is logged out

### Unfinished Work

- State management (adding redux)
  - keep track of results of the main python script
  - keep track of the state of the components when switching between side nav tabs
  - keep track of login info/user state
- Saving results
  - keep track of past results, saved inputs
  - CRUD
- Display results
  - add way to go through the output of images
  - within the app scroll through images (download results to the app)
- Better setup
  - be able to download Docker Desktop straight from the app
  - don't go to a link
- Reload issues (firebase can be slow)
  - when refreshing the browser persistence takes a second to display
  - Login page is supposed to redirect to the dashboard page
- Better loading
  - loading that shows progress, how many images have been processed
- Formatting Logs
  - logs separate line by line
  - make it so the logs don't always display (?)
- Adding json key to user info
  - right now json key is apart of app
  - make it so it is a part of user info
- Make sure python-shell is using the right python version
