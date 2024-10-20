import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import postDetailsStyle from "../Components/css/PostDetails.module.css";

function PostDetails() {
const { id } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null); // State to hold post details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3005/post/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post details');
        }
        const data = await response.json();
        setPost(data); // Set post details
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Post not found222</div>;

    return (
        <div className={postDetailsStyle.postDetails}>
          <h1>{post.title}</h1>
          <div className={postDetailsStyle.coverImage}>
            <img src={`http://localhost:3005/uploads/post-images/${post.cover_image}`} alt={post.title} />
          </div>
          <p><strong>By:</strong> {post.user.name}</p> {/* Display author's name */}
          <p><strong>Cooking Time:</strong> {post.recipe_time}</p>
          <p><strong>Posted On:</strong> {new Date(post.post_date).toLocaleDateString()}</p>
          
          <div className={postDetailsStyle.description}>
            <h2>Description</h2>
            <p>{post.description}</p>
          </div>
    
          {/* Display Steps */}
          <div className={postDetailsStyle.steps}>
            <h2>Steps</h2>
            {post.steps.map((step) => (
              <div key={step.step_id} className={postDetailsStyle.step}>
                <h3>Step {step.step_number}</h3>
                <p>{step.step_text}</p>
              </div>
            ))}
          </div>
    
          {/* Display Pictures */}
          <div className={postDetailsStyle.pictures}>
            <h2>Pictures</h2>
            {post.pictures.length > 0 ? (
              post.pictures.map((pic) => (
                <img key={pic.picture_id} src={`http://localhost:3005/uploads/post-images/${pic.picture}`} alt={`Step ${pic.picture_id}`} />
              ))
            ) : (
              <p>No additional pictures available.</p>
            )}
          </div>
        </div>
      );
    };
    
    export default PostDetails;