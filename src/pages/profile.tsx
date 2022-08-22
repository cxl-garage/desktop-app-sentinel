import { User } from 'firebase/auth';
import React, { FC, useState } from 'react';
import './css/profile.css';
import profile from '../../assets/profilePic.png';
import { updateProfile, updateEmail } from 'firebase/auth';

//profile props: user, username, email
//use firebase functions and currentUser object to update email and username (displayName)

type ProfileProps = {
  user: User | null | undefined;
  username:  string | null | undefined;
  email:  string | null | undefined;
}

const Profile: FC<ProfileProps> = ({
  user,
  username,
  email
}) => {
    const [displayName, setDisplayName]=useState(username);
    const [newEmail, setNewEmail]= useState(email);

    const changeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewEmail(event.target.value);
    };
    const changeUsername = (event: React.ChangeEvent<HTMLInputElement>)=> {
      setDisplayName(event.target.value);
    };

    const onUpdateEmail = (event: any) => {
      event.preventDefault();

      updateEmail(user, newEmail).then(() => {
        console.log('email updated');
      }).catch((error) => {
        alert(error);
        console.log(error);
      })
    };
    const onUpdateUsername = (event: any) => {
      event.preventDefault();
    updateProfile(user, {
      displayName: displayName
      }).then(() => {
        console.log('username updated');
      }).catch((error) => {
        alert(error);
      })
    }
    return (
      <>
      <h1>Profile</h1>
      <div className='profile-container'>
      <img className='profile-pic' alt="profile-pic" src={profile}></img>
        <div className='inner-profile-container'>
            <label htmlFor = "username"> username:</label>
            <input
              name="username"
              type="text"
              className="profile-input"
              defaultValue={displayName === null ? 'No username set' : displayName}
              onChange={changeUsername}
            />
            <button className='update-button' onClick={onUpdateUsername}>Update name</button>
            <label htmlFor="email">email:</label>
            <input
              name="email"
              type="text"
              className="profile-input"
              defaultValue={newEmail}
              onChange={changeEmail}
            />
            <button className='update-button' onClick={onUpdateEmail}>Update email</button>
        </div>
      </div>
      </>
    );
  };

export {Profile};
