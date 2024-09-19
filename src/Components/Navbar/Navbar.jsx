import navbarstyles from './Navbar.module.css'
import {useNavigate, useLocation} from 'react-router-dom'
import React, {useState, useEffect} from 'react'
import profileIcon from '../../assets/profile.png'
import inboxIcon from '../../assets/inbox.png'
import settingsIcon from '../../assets/settings.png'
import logoutIcon from '../../assets/logout.png'

const Navbar = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false) // Replace this with actual login logic
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialPath, setInitialPath] = useState(location.pathname);
  const DropDownItem = ({ img, text, onClick }) => {
    return (
      <li className={navbarstyles['dropdownItem']} onClick={onClick}>
        <img src={img} alt={text} />
        <a>{text}</a>
      </li>
    );
  }
  const handleLogout = () => {
    fetch('http://localhost:3005/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Logout successful') {
          alert('You have been logged out.');
          // setIsAuthenticated(false);
          navigate('/signinup');  // Redirect to sign-in page
        }
      })
      .catch(error => console.error('Error logging out: ', error));
  };
  // Check if the user is authenticated and get the user ID from session
  const checkAuth = () => {
    fetch('http://localhost:3005/check-auth',{
    method: "GET",
    credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        console.log("authentication dataaalll:",data);
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(error => console.error('Error checking authentication: ', error));
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Refresh page only on route change, not on every render
    if (initialPath !== location.pathname) {
      setInitialPath(location.pathname);
      window.location.reload();
    }
  }, [location, initialPath]);

  return (
    <div className={navbarstyles['nav']}>
      <div className={navbarstyles['nav-logo']}>ReciBLog</div>
      <ul className={navbarstyles['nav-menu']}>
        <li onClick={() => navigate('/home')}>Home</li>
        <li onClick={() => navigate('/explore')}>Explore</li>
        <li onClick={() => navigate('/aboutus')}>About Us</li>
        <li onClick={() => navigate('/contact')}>Contact</li>
        <div className={navbarstyles['menu-container']}>
          <div className={navbarstyles['menu-trigger']} onClick={() =>{setOpen(!open)}}>
            <img src={profileIcon}></img>
          </div>
          {isAuthenticated ? (
            <div className={`${navbarstyles['dropdown-menu']} ${open? navbarstyles.active : navbarstyles.inactive}`}>
              <h3>Wong Wei Fong<br/><span>5-Star Michelin Chef</span></h3>
              <ul>
                  <DropDownItem img = {profileIcon} text = {'My Profile'} onClick={() => navigate('/profile')}/>
                  <DropDownItem img = {inboxIcon} text = {'Inbox'} />
                  <DropDownItem img = {settingsIcon} text = {'Settings'} />
                  <DropDownItem img = {logoutIcon} text = {'Logout'} onClick={handleLogout}/>
                  {/* <DropDownItem img = {logoutIcon} text = {'Logout'} onClick={() =>navigate('/signinup')}/> */}
              </ul>
            </div>
          ) : (
            <div className={`${navbarstyles['dropdown-menu']} ${open? navbarstyles.active : navbarstyles.inactive}`}>
              <h3>Guest<br/><span>A Blog visitor</span></h3>
              <ul>
                <DropDownItem img = {logoutIcon} text = {'Login'} onClick={() => navigate('/signinup')}/>
              </ul>
            </div>
          )}
        </div>
      </ul>
    </div>
  )
}

export default Navbar