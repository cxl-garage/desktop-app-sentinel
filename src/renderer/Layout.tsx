import './Layout.css';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from 'context/AuthContext';
import Navigation from './Navigation';
import { LoggedInNavBar } from '../components/loggedInNavBar';
import { auth } from '../provider/firebaseSetup';

//sets layout of each page after being signed in

const Layout = ({ children }: any) => {
  const navigate = useNavigate();
  const user = useContext(AuthContext);
  const signOut = async () => {
    await auth.signOut().then(() => {
      navigate('/');
    });
  };
  return (
    <>
      <LoggedInNavBar username={user.currentUser?.displayName} email={user.currentUser?.email} logOut={signOut} />
      <div className="grid">
        <div>
          <Navigation />
        </div>
        <div>{children}</div>
      </div>
    </>
  );
};
export default Layout;
