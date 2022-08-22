import * as firebase from 'firebase/app';
import { getAuth } from 'firebase/auth';

//firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyB9NCUm818A_0hT17wTNR1IJ6vBeWDgyBA',
  authDomain: 'tyto-9af2b.firebaseapp.com',
  databaseURL: 'https://tyto-9af2b.firebaseio.com',
  projectId: 'tyto-9af2b',
  storageBucket: 'tyto-9af2b.appspot.com',
  messagingSenderId: '513505087039',
  appId: '1:513505087039:web:46dd47c65f0246d99b328a',
  measurementId: 'G-73SDX9G9CN',
};

const app = firebase.initializeApp(firebaseConfig);

export const auth = getAuth(app);
