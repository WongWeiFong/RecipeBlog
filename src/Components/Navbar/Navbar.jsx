import navbarstyles from './Navbar.module.css'
import {useNavigate, useLocation} from 'react-router-dom'
import React, {useState, useEffect} from 'react'
import profileIcon from '../../assets/profile.png'
import cookbookIcon from '../../assets/cookbook.png'
import chefIcon from '../../assets/chef.png'
// import inboxIcon from '../../assets/inbox.png'
// import settingsIcon from '../../assets/settings.png'
import logoutIcon from '../../assets/logout.png'

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profilePicture, setProfilePicture] = useState(profileIcon); // Default to profile icon
  const [userName, setUserName] = useState('A Blog Visitor');
  const [initialPath, setInitialPath] = useState(location.pathname);

  const DropDownItem = ({ img, text, onClick }) => (
    <li className={navbarstyles['dropdownItem']} onClick={onClick}>
      <img src={img} alt={text} />
      <a>{text}</a>
    </li>
  );

  const handleLogout = () => {
    fetch('http://localhost:3005/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Logout successful') {
          alert('You have been logged out.');
          setIsAuthenticated(false);
          setUserId(null);
          setUserName('A Blog Visitor');
          setProfilePicture(profileIcon);  // Reset to default icon on logout
          navigate('/signinup');  // Redirect to sign-in page
        }
      })
      .catch(error => console.error('Error logging out: ', error));
  };

  // Check if the user is authenticated and get the user ID from session
  const checkAuth = () => {
    fetch('http://localhost:3005/check-auth', {
      method: "GET",
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserId(data.userId); // Assume the backend returns a userId
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(error => console.error('Error checking authentication: ', error));
  };

  // Fetch user data to get the profile picture
  const fetchUserData = () => {
    if (!userId) return;  // Avoid fetching if userId is not set
    fetch(`http://localhost:3005/profile/${userId}`)
      .then(response => response.json())
      .then(data => {
        setUserName(data.name);
        if (data.profilePicture) {
          setProfilePicture(`http://localhost:3005/uploads/profile-pictures/${data.profilePicture}`);
        }
      })
      .catch(error => console.error('Error fetching user data: ', error));
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserData();  // Fetch user data if authenticated
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    // Refresh page only on route change, not on every render
    if (initialPath !== location.pathname) {
      setInitialPath(location.pathname);
      window.location.reload();
    }
  }, [location, initialPath]);

  return (
    <div className={navbarstyles['nav']}>
      <div className={navbarstyles['nav-logo']} onClick={() => navigate('/home')}>ReciBLog</div>
      <ul className={navbarstyles['nav-menu']}>
        <li onClick={() => navigate('/home')}>Home</li>
        <li onClick={() => navigate('/explore')}>Explore</li>
        <li onClick={() => navigate('/aboutus')}>About Us</li>
        
        <div className={navbarstyles['menu-container']}>
          <div className={navbarstyles['menu-trigger']} onClick={() => setOpen(!open)}>
            {/* Use user-specific profile picture if authenticated, otherwise use default icon */}
            <img src={profilePicture} alt="Profile" />
          </div>
          {isAuthenticated ? (
            <div className={`${navbarstyles['dropdown-menu']} ${open ? navbarstyles.active : navbarstyles.inactive}`}>
              <h3>{userName}<br /><span>5-Star Michelin Chef</span></h3>
              <ul>
                <DropDownItem img={profileIcon} text={'My Profile'} onClick={() => navigate('/profile')} />
                <DropDownItem img={cookbookIcon} text={'New Post'} onClick={() => navigate('/createpost')} />
                <DropDownItem img={chefIcon} text={'My Recipe'} onClick={() => navigate('/myrecipe')}/>
                <DropDownItem img={logoutIcon} text={'Logout'} onClick={handleLogout} />
              </ul>
            </div>
          ) : (
            <div className={`${navbarstyles['dropdown-menu']} ${open ? navbarstyles.active : navbarstyles.inactive}`}>
              <h3>Guest<br /><span>{userName}</span></h3>
              <ul>
                <DropDownItem img={logoutIcon} text={'Login'} onClick={() => navigate('/signinup')} />
              </ul>
            </div>
          )}
        </div>
      </ul>
    </div>
  );
};

export default Navbar;
