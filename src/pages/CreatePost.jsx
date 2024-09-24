import React, { useState } from 'react';
import poststyles from '../Components/css/CreatePost.module.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [recipeTime, setRecipeTime] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [pictures, setPictures] = useState([]);

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handlePicturesChange = (e) => {
    setPictures([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('recipeTime', recipeTime);
    formData.append('description', description);
    formData.append('coverImage', coverImage);
    pictures.forEach((picture, index) => {
      formData.append('pictures', picture);
    });

    fetch('http://localhost:3005/create-post', {
      method: 'POST',
      body: formData,
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
