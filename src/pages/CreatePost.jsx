import React, { useEffect, useState } from 'react';
import poststyles from '../Components/css/CreatePost.module.css';
import { useNavigate } from 'react-router-dom';
// import checkConnection from '../../server/checkConnection';

const CreatePost = () => {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState('');
  const [recipeTime, setRecipeTime] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [pictures, setPictures] = useState([]);

  const navigate = useNavigate();

  // Check if the user is authenticated and get the user ID from session
  const checkAuth = () => {
   fetch('http://localhost:3005/check-auth',{
   method: "GET",
   credentials: "include",
   })
     .then(response => response.json())
     // .then(data =>console.log(data))
     .then(data => {
       console.log("authentication dataaaaaaaaL:",data);
       if (data.isAuthenticated) {
         setUserId(data.userId);  // Set the userId from the session
       } else {
         // If not authenticated, redirect to sign-in page
         alert("Please sign in before creating posts");
         navigate('/signinup');
       }
     })
     .catch(error => console.error('Error checking authentication: ', error));
 };

 useEffect(() => {
    checkAuth();  // Check authentication on component mount
  }, []);

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handlePicturesChange = (e) => {
    setPictures([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('title', title);
    formData.append('recipeTime', recipeTime);
    formData.append('description', description);
    formData.append('coverImage', coverImage);
    pictures.forEach((picture, index) => {
      formData.append('pictures', picture);
    });

    fetch('http://localhost:3005/create-post', {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        alert('Post created successfully!');
      })
      .catch((error) => {
        console.error('Error creating post:', error);
      });
  };

  return (
    <div className={poststyles['create-post-container']}>
      <h1>Create Recipe Post</h1>
      <form onSubmit={handleSubmit}>
        <div className={poststyles['form-group']}>
          <label htmlFor="title">Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className={poststyles['form-group']}>
          <label htmlFor="recipeTime">Recipe Time</label>
          <input type="text" id="recipeTime" value={recipeTime} onChange={(e) => setRecipeTime(e.target.value)} required />
        </div>
        <div className={poststyles['form-group']}>
          <label htmlFor="description">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className={poststyles['form-group']}>
          <label htmlFor="coverImage">Cover Image</label>
          <input type="file" id="coverImage" accept="image/*" onChange={handleCoverImageChange} required />
        </div>
        <div className={poststyles['form-group']}>
          <label htmlFor="pictures">Additional Pictures</label>
          <input type="file" id="pictures" accept="image/*" multiple onChange={handlePicturesChange} />
        </div>
        <button type="submit" className={poststyles['btn-submit']}>Submit Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
