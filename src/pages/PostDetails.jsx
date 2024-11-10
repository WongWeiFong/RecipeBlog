import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import postDetailsStyle from "../Components/css/PostDetails.module.css";

function PostDetails() {
  const { id } = useParams(); // Get the post ID from the URL
  const [post, setPost] = useState(null); // State to hold post details
  const [ingredients, setIngredients] = useState([]); // State to hold ingredients
  const [steps, setSteps] = useState([]); // State to hold steps
  const [pictures, setPictures] = useState([]); // State to hold pictures
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setLoading(false);
        console.log(data);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Post not found</div>;

  return (
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
  );
}

export default PostDetails;
