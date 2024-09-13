import React, {useState} from "react";
import Navbar from "../src/Components/Navbar/Navbar";
import styles from "../Components/css/SignInUp.module.css";

const SignInUp = () => {
  const [addclass, setaddclass] = useState("");
  return (
    <>
    <Navbar />
    <div className={`${styles.container} ${addclass}`} id="container">
      <div className={`${styles["form-container"]} ${styles["sign-up-container"]}`}>
        <form>
          <h1>Create New Account</h1>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">REGISTER</button>
        </form>
      </div>
      <div className={`${styles["form-container"]} ${styles["sign-in-container"]}`}>
        <form>
          <h1>Login My Account</h1>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">LOGIN</button>
        </form>        
      </div>
      <div className={styles["overlay-container"]}>
        <div className={styles.overlay}>
          <div className={`${styles["overlay-panel"]} ${styles["overlay-left"]}`}>
            <button className={styles.ghost} id="signin" onClick={()=>setaddclass("")}>
              I HAVE AN ACCOUNT!
            </button>
          </div>
          <div className={`${styles["overlay-panel"]} ${styles["overlay-right"]}`}>
            <button className={styles.ghost} id="signup" onClick={()=>setaddclass("right-panel-active")}>
               I WANT TO MAKE NEW ACCOUNT!
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SignInUp;
