import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import exploreStyles from "../Components/css/Explore.module.css";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const handlePostClick = (post_id) => {
        console.log("Clicked post ID:", post_id); // Log postId to debug
        if (post_id) {
            navigate(`/post/${post_id}`); // Redirect only if postId exists
        } else {
            console.error("Post ID is undefined!"); // Add error log if undefined
        }
    };

  useEffect(() => {
    fetch("http://localhost:3005/posts")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setPosts(data);
      })
      .catch((error) => console.error("Error fetching error: ", error));
  }, []);

  useEffect(() => {
  fetch('http://localhost:3005/explore-posts')
    .then(response => response.json())
    .then(data => {
      console.log('Received posts:', data); // Check if post_id is part of the response
      setPosts(data); // Set the posts data to state
    })
    .catch(error => console.error('Error fetching posts:', error));
}, []);


  useEffect(() => {
    console.log(posts); // Log the posts array to verify post_id
  }, [posts]);

  return (
    <div className={exploreStyles.exploreContainer}>
      <h1>Explore Recipes</h1>
      <div className={exploreStyles.postsGrid}>
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post, index) => (
            <div 
              key={index} 
              className={exploreStyles.postCard} 
              onClick={() => handlePostClick(post.post_id)} // Redirect when clicked
              style={{ cursor: 'pointer' }} // Add a pointer to indicate it's clickable
            >
              <img
                src={`http://localhost:3005/uploads/post-images/${post.cover_image}`}
                alt={post.title}
                className={exploreStyles.coverImage}
              />
              <h3>{post.title}</h3>
              <div className={exploreStyles.postInfo}>
                <span className={exploreStyles.userName}>{post.user_name}</span>
                <span className={exploreStyles.postDate}>
                  {new Date(post.post_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
};

export default Explore;
