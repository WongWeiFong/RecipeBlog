import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import postdetailsstyles from '../Components/css/PostDetails.module.css';

const PostDetails = () => {
  const { id } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the post details from the backend
    fetch(`http://localhost:3005/post/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching post details');
        }
        return response.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!post) {
    return <p>No post found</p>;
  }

  return (
    <div className={postdetailsstyles["post-details"]}>
      <h1>{post.title}</h1>
      <p>By: {post.name}</p>
      <p>Posted on: {new Date(post.post_date).toLocaleDateString()}</p>
      <p>Recipe Time: {post.recipe_time} minutes</p>

      {post.cover_image && (
        <div className={postdetailsstyles["cover-image"]}>
          <img src={`http://localhost:3005/uploads/post-images/${post.cover_image}`} alt={post.title} />
        </div>
      )}

      <div className={postdetailsstyles["description"]}>
        <h2>Description:</h2>
        <p>{post.description}</p>
      </div>

      {post.pictures && post.pictures.length > 0 && (
        <div className={postdetailsstyles["pictures"]}>
          <h2>Pictures:</h2>
          {post.pictures.map((pic, index) => (
            <img key={index} src={`http://localhost:3005/uploads/post-images/${pic}`} alt={`Post Image ${index + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostDetails;
