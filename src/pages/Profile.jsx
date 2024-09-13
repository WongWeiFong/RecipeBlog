import React, { useEffect, useState } from 'react';
import profilestyles from '../Components/css/Profile.module.css';

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);

  const userId = 1;

  const fetchUserData = () => {
    fetch(`http://localhost:3005/profile/${userId}`)
      .then(response => response.json())
      .then(data => {
        setName(data.name);
        setEmail(data.email);
        setPassword(data.password);
        // console.log(data.profilePicture);
        // console.log('Profile Picture URL:', `http://localhost:3005/uploads/${data.profilePicture}`);

        if (data.profilePicture) {
          // Display the image preview
          setPreview(`http://localhost:3005/uploads/${data.profilePicture}`);
        }
      })
      .catch(error => console.error('Error fetching user data: ', error));
  };
  
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));  // Create a preview for the selected file
    }
  }

  // Handle save changes
  const handleSaveChanges = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    fetch(`http://localhost:3005/profile/${userId}`, {
      method: 'PUT',
      body: formData
    })
    .then(() => {
      alert('Profile changes saved!');
    })
    .catch(error => console.error('Error saving changes: ', error));
  };

  const handleCancel = () => {
    alert("Changes canceled");
    fetchUserData();
  }

  return (
    <div className={profilestyles["profile-container"]}>
      <h1>Profile</h1>
      <ul />
      <form onSubmit={handleSaveChanges}>
        {/* Profile Picture */}
        <div className={profilestyles["profilePicture"]}>
          <label htmlFor="profilePicture">Profile Picture</label>
          <input type="file" id="profilePicture" accept="image/*" onChange={handleProfilePictureChange} />
          {preview ? (
            <img src={preview} alt="Profile Preview" className={profilestyles.profileImgPreview} />
          ) : (
            <div className={profilestyles.profileImgPlaceholder}>No Image Uploaded</div>
          )}
        </div>
        {/* Name Field */}
        <div className={profilestyles["formGroup"]}>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {/* Email Field */}
        <div className={profilestyles["formGroup"]}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {/* Password Field */}
        <div className={profilestyles["formGroup"]}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {/* Button */}
        <div className={profilestyles["formActions"]}>
          <button type="submit" className={profilestyles["btnSave"]}>Save Changes</button>
          <button type="button" className={profilestyles["btnCancel"]} onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
