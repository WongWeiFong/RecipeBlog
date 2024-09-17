import React, { useState } from 'react';
import axios from 'axios';
import Navbar from "../Components/Navbar/Navbar";
import styles from "../Components/css/SignInUp.module.css";

const SignInUp = () => {
  const [isSignInActive, setIsSignInActive] = useState(true);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const handleSlide = () => {
    setIsSignInActive(!isSignInActive);
  };

  // Handle Sign Up Submit (optional)
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:3005/signup', {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword
      });

      if (response.status === 200) {
        alert('User registered successfully!');
      }
    } catch (error) {
      if (error.response && error.response.status === 500) {
        alert('Email already in use. Try another email'); // Display appropriate error message
      } else if (error.response && error.response.status === 300) {
        alert('All fields are required!');
      } else if (error.response && error.response.status === 100) {
        alert('Connection error!');
      } else {
        alert('Error during sign-up. Please check console for details.');
        console.error('Error during sign-up:', error);
      }
    }
  };

  // Handle Sign In Submit
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3005/signin', {
        email: signInEmail,
        password: signInPassword
      });

      // Handle the response from the server
      if (response.status === 201) {
        alert('Sign-in successful!');
      } 
    } catch (error) {
      if (error.response && error.response.status === 501) {
        alert('User not found!'); // Display appropriate error message
      } else if (error.response && error.response.status === 301) {
        alert('Email and password are required!');
      } else if (error.response && error.response.status === 401) {
        alert('Invalid email or password. Please try again!');
      } else if (error.response && error.response.status === 101) {
        alert('Connection error!');
      } else {
        alert('Error during sign-in. Please check console for details.');
        console.error('Error during sign-in:', error);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles['container']}>
        <div className={`${styles['form-container']} ${isSignInActive ? '' : styles['right-panel-active']}`}>
          {/* Sign In Form */}
          <div className={`${styles['form']} ${styles['sign-in-form']}`}>
            <h1>Login</h1>
            <input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              className={styles['input']}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              className={styles['input']}
              required
            />
            <button className={styles['btn']} onClick={handleSignInSubmit}>Sign In</button>
          </div>

          {/* Sign Up Form */}
          <div className={`${styles['form']} ${styles['sign-up-form']}`}>
            <h1>Register</h1>
            <input
              type="text"
              placeholder="Name"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              className={styles['input']}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              className={styles['input']}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              className={styles['input']}
              required
            />
            <button className={styles['btn']} onClick={handleSignUpSubmit}>Sign Up</button>
          </div>

          <div className={styles['overlay-container']}>
            <div className={styles['overlay']}>
              <div className={styles['overlay-panel']}>
                {isSignInActive ? (
                  <>
                    <h1>New here?</h1>
                    <p>Create an account and join us!</p>
                    <button className={styles['ghost']} onClick={handleSlide}>Sign Up</button>
                  </>
                ) : (
                  <>
                    <h1>Already a member?</h1>
                    <p>Sign in and start your journey!</p>
                    <button className={styles['ghost']} onClick={handleSlide}>Sign In</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInUp;
