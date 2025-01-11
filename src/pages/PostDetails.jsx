import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import postDetailsStyle from "../Components/css/PostDetails.module.css";

function PostDetails() {
  const { id } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null); // State to hold post details
  const [ingredients, setIngredients] = useState([]); // State to hold ingredients
  const [steps, setSteps] = useState([]); // State to hold steps
  const [pictures, setPictures] = useState([]); // State to hold pictures
  const [comments, setComments] = useState([]); // State to hold comments
  const [newComment, setNewComment] = useState(""); // State for new comment text
  const [isAddingComment, setIsAddingComment] = useState(false); // State for comment form visibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null); // Track userId if needed
  const navigate = useNavigate();

  const checkAuth = () => {
    fetch("http://localhost:3005/check-auth", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Authentication data:", data);
        if (data.isAuthenticated) {
          setIsAuthenticated(true); // User is authenticated
          setUserId(data.userId); // Set the userId from the session
        } else {
          setIsAuthenticated(false); // User is not authenticated
        }
      })
      .catch((error) =>
        console.error("Error checking authentication: ", error)
      );
  };

  useEffect(() => {
    checkAuth(); // Check authentication on component mount
  }, []);
  
  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3005/post/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post details");
        }
        const data = await response.json();

        // console.log("Original steps:", data.steps);
        // console.log("Original pictures:", data.pictures);

        // Remove duplicate ingredients
        const uniqueIngredients = data.ingredients.filter(
          (ingredient, index, self) =>
            index === self.findIndex((i) => i.ingredient_id === ingredient.ingredient_id)
        );

        // Remove duplicate steps
        const uniqueSteps = data.steps.filter(
          (step, index, self) =>
            index === self.findIndex((s) => s.step_id === step.step_id)
        );

        // Remove duplicate pictures
        const uniquePictures = data.pictures.filter(
          (pic, index, self) =>
            index === self.findIndex((p) => p.picture_id === pic.picture_id)
        );

        setPost(data); // Set post details
        setIngredients(uniqueIngredients); // Set ingredients
        setSteps(uniqueSteps); // Set steps
        setPictures(uniquePictures); // Set pictures
        setComments(data.comments || []); // Assuming comments are included in the response
        setLoading(false);
        console.log(data);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3005/post/${id}/comments`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchComments(); // Fetch comments when the component mounts
  }, [id]);

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      alert("You need to be logged in to add a comment.");
      navigate("/signinup");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3005/post/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment, author: userId }),
      });
      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
      const addedComment = await response.json();
      setComments((prevComments) => [...prevComments, addedComment]);
      setNewComment("");
      setIsAddingComment(false);
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Post not found</div>;

  return (
    <div>
      <div className={postDetailsStyle.postContainer}>
        <div className={postDetailsStyle.postDetails}>
          <h1>{post.title}</h1>
          <div className={postDetailsStyle.coverImage}>
            <img
              src={`http://localhost:3005/uploads/post-images/${post.cover_image}`}
              alt={post.title}
            />
          </div>
          <p>
            <strong>By:</strong> {post.user.name}
          </p>{" "}
          {/* Display author's name */}
          <p>
            <strong>Cooking Time:</strong> {post.recipe_time}
          </p>
          <p>
            <strong>Posted On:</strong>{" "}
            {new Date(post.post_date).toLocaleDateString()}
          </p>
        </div>

        {/* Display Ingredients */}
        <div className={postDetailsStyle.postDetails}>
          <div className={postDetailsStyle.ingredients}>
            <h2>Ingredients</h2><br/>
            {ingredients.length > 0 ? (
              ingredients.map((ingredient) => (
                <div key={ingredient.ingredient_id} className={postDetailsStyle.ingredient}>
                  {/* <h3></h3> */}
                  <p>{ingredient.ingredient}</p>
                </div>
              ))
            ) : (
              <p>This recipe requires no ingredient.</p>
            )}
          </div>
        </div>

        {/* Display Description */}
        <div className={postDetailsStyle.postDetails}>
          <div className={postDetailsStyle.description}>
            <h2>Description</h2><br />
            <p>{post.description}</p>
          </div>
        </div>

        {/* Display Pictures */}
        <div className={postDetailsStyle.postDetails}>
          <div className={postDetailsStyle.pictures}>
            <h2>Pictures</h2>
            {pictures.length > 0 ? (
              <div className={postDetailsStyle.pictureGrid}>
                {pictures.map((pic) => (
                  <img
                    key={pic.picture_id}
                    src={`http://localhost:3005/uploads/post-images/${pic.picture}`}
                    alt={`Step ${pic.picture_id}`}
                    className={postDetailsStyle.recipePicture}
                  />
                ))}
              </div>
            ) : (
              <p>No additional pictures available.</p>
            )}
          </div>
        </div>

        {/* Display Steps */}
        <div className={postDetailsStyle.postDetails}>
          <div className={postDetailsStyle.steps}>
            <h2>Steps</h2>
            {steps.length > 0 ? (
              steps.map((step) => (
                <div key={step.step_id} className={postDetailsStyle.step}>
                  <h3>Step {step.step_number}</h3>
                  <p>{step.step_text}</p>
                </div>
              ))
            ) : (
              <p>This recipe requires no step.</p>
            )}
          </div>
        </div>
      </div>
      <div className={postDetailsStyle.sidebarContainer}>
        <div
          className={`${postDetailsStyle.sidebar} ${
            sidebarOpen ? postDetailsStyle.open : ""
          }`}
          onClick={!sidebarOpen ? () => setSidebarOpen(true) : undefined}
        >
        {!sidebarOpen ? (
          <div className={postDetailsStyle.logo}>
            <span>💬</span>
          </div>
        ) : (
            /* If sidebar is open, show the content area */
            <div className={postDetailsStyle.sidebarContent}>            
              {/* Fixed (pinned) header with "Comments" and add-comment section */}
              <div className={postDetailsStyle.fixedHeader}>
                <h2 style={{ textAlign: "center" }}>Comments</h2>
                  <button
                    className={postDetailsStyle.toggleButton}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span>&times;</span>
                  </button>
                <br />
                <div className={postDetailsStyle.commentFormContainer}>
                  {isAddingComment ? (
                    <div className={postDetailsStyle.commentForm}>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your comment..."
                      />
                      <button onClick={handleAddComment}>Add Comment</button>
                      <button onClick={() => setIsAddingComment(false)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingComment(true)}
                      disabled={!isAuthenticated}
                      style={{
                        cursor: isAuthenticated ? "pointer" : "not-allowed",
                      }}
                    >
                      Add Comment
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable comments list */}
              <div className={postDetailsStyle.commentScroll}>
              {/* <div> */}
                {comments.map((comment) => (
                  <div key={comment.id} className={postDetailsStyle.comment}>
                    <div className={postDetailsStyle.commentHeader}>
                      <p className={postDetailsStyle.commentAuthor}>
                        <strong>{comment.name}</strong>
                      </p>
                      <p className={postDetailsStyle.commentDate}>
                        {new Date(comment.date).toLocaleString()}
                      </p>
                    </div>
                    <p className={postDetailsStyle.commentText}>
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetails;
