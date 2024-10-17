import React, { useEffect, useState } from 'react';
import exploreStyles from '../Components/css/Explore.module.css';

const Explore = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3005/posts')
    .then(response => response.json())
    .then(data => setPosts(data))
    .catch(error => console.error("Error fetching error: ", error));
  }, []);

  return (
    <div className={exploreStyles.exploreContainer}>
      <h1>Explore Recipes</h1>
      <div className={exploreStyles.postsGrid}>
        {posts.map((post, index) => (
          <div key={index} className={exploreStyles.postCard}>
            <img 
              src={`http://localhost:3005/uploads/post-images/${post.cover_image}`} 
              alt={post.title} 
              className={exploreStyles.coverImage} 
            />
            <h3>{post.title}</h3>
            <p>{new Date(post.post_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Explore