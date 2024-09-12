import navbarstyles from './Navbar.module.css'
import {useNavigate} from 'react-router-dom'
import React, {useState} from 'react'
import profileIcon from '../../assets/profile.png'
import inboxIcon from '../../assets/inbox.png'
import settingsIcon from '../../assets/settings.png'
import logoutIcon from '../../assets/logout.png'

const Navbar = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false) // Replace this with actual login logic
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
  const DropDownItem = ({ img, text, onClick }) => {
    return (
      <li className={navbarstyles['dropdownItem']} onClick={onClick}>
        <img src={img} alt={text} />
        <a>{text}</a>
      </li>
    );
  }

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
          <div className={`${navbarstyles['dropdown-menu']} ${open? navbarstyles.active : navbarstyles.inactive}`}>
            <h3>Wong Wei Fong<br/><span>5-Star Michelin Chef</span></h3>
            <ul>
                <DropDownItem img = {profileIcon} text = {'My Profile'} onClick={() => navigate('/profile')}/>
                <DropDownItem img = {inboxIcon} text = {'Inbox'} />
                <DropDownItem img = {settingsIcon} text = {'Settings'} />
                <DropDownItem img = {logoutIcon} text = {'Logout'} />
            </ul>
          </div>
        </div>
      </ul>
    </div>
  )
}

export default Navbar