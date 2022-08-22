import { useRef, useEffect, useContext } from 'react';
import './css/login.css';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Navbar } from 'react-bootstrap';
import {
  setPersistence,
  signInWithEmailAndPassword,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '../provider/firebaseSetup';
import icon from '../../assets/icon.png';
import { AuthContext } from 'context/AuthContext';

//logged out navbar for when user is logged out
const LoggedOutNavBar = () => {
  return (
    <nav className="navbar-signed-out">
      <img src={icon} alt="upper-icon" width="20" />
      <span>Conservation X Labs</span>
    </nav>
  );
};

const Login = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const user=useContext(AuthContext); //user object from AuthContext
  const signIn = async () => {
    await setPersistence(auth, browserLocalPersistence); //set auth persistence
    try {
      //signin with values inputed by user, if correct, navigate to dashboard or alert error
      await signInWithEmailAndPassword(
        auth,
        emailRef.current!.value,
        passwordRef.current!.value
      ).then(() => {
        navigate('/dashboard');
      });
    } catch (error) {
      alert(error);
    }
  };

  //change state of auth
  auth.onAuthStateChanged(function (user) {
    if (user) {
      navigate('/dashboard');
    }
  });

  //useEffect; if the current user is already given, navigate to dashboard
  //currentUser has firebase user information
  useEffect(() => {
    if (user.currentUser) navigate("/dashboard");
  }, [user.currentUser]);

  return (
    <>
      <LoggedOutNavBar />
      <Container className="sign-in-container" fluid>
        <p className="sign-in-header">login</p>
        <Form className="mt-4s">
          <Form.Group style={{ marginTop: '24%' }} controlId="formEmail">
            <Form.Control
              className="sign-in-inputs"
              ref={emailRef}
              type="email"
              placeholder="email"
            />
          </Form.Group>
          <Form.Group controlId="formPassword">
            <Form.Control
              className="sign-in-inputs"
              ref={passwordRef}
              type="password"
              placeholder="password"
            />
          </Form.Group>
          <Form>
            <Col xs={6}>
              <Button
                onClick={signIn}
                type="button"
                variant="secondary"
                className="sign-in-button"
              >
                submit
              </Button>
            </Col>
          </Form>
        </Form>
      </Container>
    </>
  );
};

export default Login;
