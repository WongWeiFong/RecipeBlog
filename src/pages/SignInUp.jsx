import React, {useState} from "react";
import Navbar from "../Components/Navbar/Navbar";
import styles from "../Components/css/SignInUp.module.css";

const SlidingForm = () => {
  const [isSignInActive, setIsSignInActive] = useState(true);

  const handleSlide = () => {
    setIsSignInActive(!isSignInActive);
  };

  return (
    <>
    <Navbar />
    <div className={styles['container']}>
      <div className={`${styles['form-container']} ${isSignInActive ? '' : styles['right-panel-active']}`}>
        <div className={`${styles['form']} ${styles['sign-in-form']}`}>
          <h1>Login</h1>
          <input type="email" placeholder="Email" className={styles['input']} />
          <input type="password" placeholder="Password" className={styles['input']} />
          <button className={styles['btn']}>Sign In</button>
        </div>
        <div className={`${styles['form']} ${styles['sign-up-form']}`}>
          <h1>Register</h1>
          <input type="text" placeholder="Name" className={styles['input']} />
          <input type="email" placeholder="Email" className={styles['input']} />
          <input type="password" placeholder="Password" className={styles['input']} />
          <button className={styles['btn']}>Sign Up</button>
        </div>
        <div className={styles['overlay-container']}>
          <div className={styles['overlay']}>
            <div className={styles['overlay-panel']}>
              {isSignInActive ? (
                <>
                  <h1>New here?</h1>
                  <p>Create an account and join us!</p>
                  <button className={styles['ghost']} onClick={handleSlide}>
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  <h1>Already a member?</h1>
                  <p>Sign in and start your journey!</p>
                  <button className={styles['ghost']} onClick={handleSlide}>
                    Sign In
                  </button>
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

export default SlidingForm;
