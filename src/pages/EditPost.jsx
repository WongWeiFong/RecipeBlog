import React, { useEffect, useState } from "react";
import poststyles from "../Components/css/CreatePost.module.css";
import trashIcon from "../assets/trash.png";
import cameraIcon from "../assets/camera.png";
import { useNavigate, useParams } from "react-router-dom";

const EditPost = () => {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [recipeTime, setRecipeTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [coverImage, setCoverImage] = useState(null);
  const [pictures, setPictures] = useState([]);
  const [steps, setSteps] = useState([""]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [picturesPreview, setPicturesPreview] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const { postId } = useParams(); // Get post ID from the URL

  useEffect(() => {
    console.log("Post ID:", postId);
  }, [postId]);

//   useEffect(() => {
//     // Fetch the post data for editing
//     fetch(`http://localhost:3005/editpost/${postId}`, {
//       method: "GET",
//       credentials: "include",
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         // Populate fields with the fetched data
//         setTitle(data.title || "");
//         setRecipeTime(data.recipeTime.split(" ")[0]);
//         setTimeUnit(data.recipeTime.split(" ")[1]);
//         setDescription(data.description);
//         setIngredients(data.ingredients);
//         setSteps(data.steps);
//         setCoverPreview(data.coverImage);
//         setPicturesPreview(data.pictures || []);
//       })
//       .catch((error) => console.error("Error fetching post data:", error));
//   }, [postId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching post data...");
        const response = await fetch(`http://localhost:3005/editpost/${postId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        console.log("Fetched data:", data);
  
        if (response.ok) {
          setTitle(data.title || "");
          setDescription(data.description || "");
          // setCoverPreview(data.cover_image || null);
          // setCoverPreview(`http://localhost:3005/${data.cover_image}` || null);
          setCoverPreview(data.cover_image ? `/server/uploads/post-images/${data.cover_image}` : null);
          setRecipeTime(data.recipe_time.split(" ")[0] || "");
          setTimeUnit(data.recipe_time.split(" ")[1] || "minutes");
          setIngredients(data.ingredients || [""]);
          setSteps(data.steps || [""]);
          setPicturesPreview(data.pictures ? data.pictures.map(pic => `http://localhost:3005/${pic}`) : []);
        } else {
          console.error("Error fetching post:", data.message);
        }
      } catch (error) {
        console.error("Error in fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [postId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!title && !description) {
    return <div>Error: Unable to load post data. Please try again.</div>;
  }

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file)); // Preview for cover image
    }
  };

  // const handleIngredientChange = (index, value) => {
  //   const newIngredients = [...ingredients];
  //   newIngredients[index] = value;
  //   setIngredients(newIngredients);
  // };

  // const handleAddIngredient = () => setIngredients([...ingredients, ""]);
  // const handleRemoveIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));

  const handleIngredientChange = (e, index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = e.target.value;
    setIngredients(updatedIngredients);
  };
  
  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };
  
  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAutoResize = (e) => {
    e.target.style.height = "auto"; // Reset the height to auto to recalculate
    e.target.style.height = `${e.target.scrollHeight}px`; // Set the height dynamically
  };

  // const handleStepChange = (index, value) => {
  //   const newSteps = [...steps];
  //   newSteps[index] = value;
  //   setSteps(newSteps);
  // };

  // const addStep = () => setSteps([...steps, ""]);
  // const removeStep = (index) => setSteps(steps.filter((_, i) => i !== index));

  const handleStepChange = (e, index) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...steps[index], text: e.target.value };
    setSteps(updatedSteps);
  };
  
  const addStep = () => {
    setSteps([...steps, { text: "" }]);
  };
  
  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handlePicturesChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPictures([...pictures, ...files]);
    setPicturesPreview([...picturesPreview, ...previews]);
  };

  const handleRemovePicture = (index) => {
    setPictures(pictures.filter((_, i) => i !== index));
    setPicturesPreview(picturesPreview.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("recipeTime", `${recipeTime} ${timeUnit}`);
    formData.append("description", description);
    formData.append("coverImage", coverImage); // File upload (cover image)
    ingredients.forEach((ingredient, index) => {
      formData.append(`ingredients[${index}]`, ingredient);
    });
    steps.forEach((step, index) => {
      formData.append(`steps[${index}]`, step);
    });
    pictures.forEach((picture) => {
      formData.append("pictures", picture);
    });

    try {
      const response = await fetch(`http://localhost:3005/posts/${postId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        alert("Post updated successfully!");
        navigate(`/posts/${postId}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
    }
    } catch (error) {
      console.error("Error during updating recipe:", error);
      alert("An error occurred while updating the recipe.");
    }
  };

  return (
    <div className={poststyles.createPostContainer}>
      <h1>Edit Recipe</h1>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className={poststyles.formGroup}>
          <label htmlFor="title">Recipe Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className={poststyles.formGroup}>
          <label htmlFor="description">Recipe Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            required
          />
        </div>

        {/* Cover Image */}
        <div className={poststyles.formGroup}>
          <label>Cover Image</label>
          <div className={poststyles.alignment}>
            <div 
            className={poststyles.imagePreviewContainer}
            onClick={() => document.getElementById("coverImage").click()}>
                {coverPreview ? (
                <img src={coverPreview} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
                ) : (
                <div>Click to upload an image</div>
                )}
            </div>
            <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleCoverImageChange}
                style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Recipe Time */}
        <div className={poststyles.formGroup}>
          <label htmlFor="recipeTime">Cooking Time</label>
          <div className={poststyles.timeInputContainer}>
            <input
              type="number"
              id="recipeTime"
              value={recipeTime}
              onChange={(e) => setRecipeTime(e.target.value)}
              min="1"
              required
            />
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>

        {/* Ingredients */}
        <div className={poststyles.formGroup}>
          <h2>Ingredients</h2>
          {ingredients.map((ingredient, index) => (
            <div key={index} className={poststyles.ingredientGroup}>
              <label htmlFor={`${index + 1}`}>{index + 1}</label>
              <input
                key={index}
                type="text"
                placeholder="Enter ingredient"
                value={ingredient.ingredient}
                // onChange={(e) => handleIngredientChange(index, e.target.value)}
                onChange={(e) => handleIngredientChange(e, index)}
              />
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                disabled={ingredients.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddIngredient}>
            Add Ingredient
          </button>
        </div>

        {/* Steps */}
          <div className={poststyles.stepsContainer}>
            <h3>Steps</h3>
            {steps.map((step, stepIndex) => (
              <div key={stepIndex} className={poststyles.stepGroup}>
                <label htmlFor={`step-${stepIndex + 1}`}>
            Steps {stepIndex + 1}
                </label>
                <textarea
            id={`step-${stepIndex + 1}`}
            value={step.step_text}
            onChange={(e) => handleStepChange(e, stepIndex)}
            placeholder=""
            onInput={handleAutoResize}
            rows="4"
            required
                />
                <button
            type="button"
            onClick={() => removeStep(stepIndex)}
            className={poststyles.removeStepButton}
            disabled={steps.length === 1}
                >
            Remove Step
                </button>

              </div>
          ))}

          <button
              type="button"
              onClick={addStep}
              className={poststyles.addStepButton}
            >
              {/* disabled={steps.length === 10}> */}+ Add Step
          </button>
        </div>
        <br />

        {/* Additional Pictures */}
        <div className={poststyles.formGroup}>
          <label>Additional Pictures:</label>
          <div className={poststyles.picturesPreviewContainer}>
            {pictures.map((pic, index) => (
              <div key={index} className={poststyles.pictureContainer}>
                <img
                  src={URL.createObjectURL(pic)}
                  alt={`picture ${index + 1}`}
                  className={poststyles.picturePreview}
                />
                <div className={poststyles.pictureActions}>
                  <button
                    type="button"
                    onClick={() => handleRemovePicture(index)}
                    className={poststyles.removePictureButton}
                  >
                    <img
                      src={trashIcon}
                      alt="Remove"
                      className={poststyles.actionIcon}
                    />{" "}
                    {/* Trash icon */}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById(`picture-${index}`).click()
                    }
                    className={poststyles.reuploadPictureButton}
                  >
                    <img
                      src={cameraIcon}
                      alt="Reupload"
                      className={poststyles.actionIcon}
                    />{" "}
                    {/* Camera icon */}
                  </button>
                </div>
                <input
                  type="file"
                  id={`picture-${index}`}
                  accept="image/*"
                  multiple
                  onChange={handlePicturesChange}
                  style={{ display: "none" }}
                />
              </div>
            ))}
          </div>
          <div
            className={poststyles.imagePreviewContainer}
            onClick={() => document.getElementById("pictures").click()}
            style={{
              cursor: "pointer",
              border: "1px dashed #ccc",
              padding: "10px",
              textAlign: "center",
            }}
          >
            <img
              src={cameraIcon}
              alt="Add Pictures"
              style={{ width: "30px", height: "30px" }}
            />{" "}
            {/* Use camera icon for adding pictures */}
            <div> + Add More Pictures</div>
          </div>
          <input
            type="file"
            id="pictures"
            multiple
            accept="image/*"
            onChange={handlePicturesChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Submit Button */}
        <div className={poststyles.btnContainer}>
          <button type="submit">Update Recipe</button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
