import { useEffect, useState } from 'react';
import firebase from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { auth } from './firebaseSetup';

interface Props {
  children: React.ReactNode;
}

//auth object from firebaseSetup
//gives currentUser value to its children
export const AuthProvider = ({ children }: Props) => {
  const [currentUser, setCurrentUser] =  useState<firebase.User | null>(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
  }

