import React, { useEffect, useState } from "react";
import poststyles from "../Components/css/CreatePost.module.css";
import trashIcon from "../assets/trash.png";
import cameraIcon from "../assets/camera.png";
import { useNavigate } from "react-router-dom";
// import checkConnection from '../../server/checkConnection';

const CreatePost = () => {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [recipeTime, setRecipeTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [coverImage, setCoverImage] = useState(null);
  const [pictures, setPictures] = useState([]);
  const [steps, setSteps] = useState(['']); // For handling multiple steps
  // const [steps, setSteps] = useState([{ text: "", images: [] }]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [picturesPreview, setPicturesPreview] = useState([]);

  const navigate = useNavigate();

  // Check if the user is authenticated and get the user ID from session
  const checkAuth = () => {
    fetch("http://localhost:3005/check-auth", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      // .then(data =>console.log(data))
      .then((data) => {
        console.log("authentication dataaaaaaaaL:", data);
        if (data.isAuthenticated) {
          setUserId(data.userId); // Set the userId from the session
        } else {
          // If not authenticated, redirect to sign-in page
          alert("Please sign in before creating posts");
          navigate("/signinup");
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
    return () => {
      URL.revokeObjectURL(coverPreview);
      picturesPreview.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [coverPreview, picturesPreview]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file)); // Preview for cover image
    }
  };

  // Function to handle ingredient change
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  // Function to add a new ingredient input
  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  // Handle dynamic height adjustment for textareas
  const handleAutoResize = (e) => {
    e.target.style.height = "auto"; // Reset the height to auto to recalculate
    e.target.style.height = `${e.target.scrollHeight}px`; // Set the height dynamically
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, '' ]);
  };

  const removeStep = (index) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1); // Remove step at the specified index
    setSteps(newSteps);
  };

  const handlePicturesChange = (e) => {
    const files = Array.from(e.target.files); // Handle multiple file upload
    const previews = files.map((file) => URL.createObjectURL(file));
    setPictures([...pictures, ...files]);
    setPicturesPreview([...picturesPreview, ...previews]);
  };

  const handleRemovePicture = (index) => {
    const updatedPictures = [...pictures];
    updatedPictures.splice(index, 1);
    setPictures(updatedPictures);

    const updatedPreviews = [...picturesPreview];
    updatedPreviews.splice(index, 1);
    setPicturesPreview(updatedPreviews);
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
    }); // Each ingredient as part of form data

    steps.forEach((step, index) => {formData.append(`steps[${index}]`, step)});  // Each step as part of form data    
    pictures.forEach((picture) => {
      formData.append(`pictures`, picture);
    });

    try {
      const response = await fetch("http://localhost:3005/create-post", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Post created successfully:", data);
      } else {
        console.error("Error creating post:", data);
      }

      if (response.status === 201) {
        alert("Recipe created!");
        navigate("/explore");
      }
    } catch (error) {
      if (error.response && error.response.status === 200) {
        alert("Every step must have description."); // Display appropriate error message
      } else if (error.response && error.response.status === 500) {
        //   alert('Error saving steps.');
        // } else {
        alert(
          "Error during creating recipe. Please check console for details."
        );
        console.error("Error during creating recipe: ", error);
      }
    }
  };

  return (
    <div className={poststyles.createPostContainer}>
      <h1>Create a New Recipe</h1>
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
            onInput={handleAutoResize}
            rows="5"
            placeholder="Briefly introduce your food"
            required
          />
        </div>

        {/* Cover Image */}
        <div className={poststyles.formGroup}>
          <label>Cover Image</label>
          <div className={poststyles.alignment}>
            <div
              className={poststyles.imagePreviewContainer}
              onClick={() => document.getElementById("coverImage").click()}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  className={poststyles.coverPreview}
                />
              ) : (
                <div className={poststyles.placeholder}>
                  Click to upload an image
                </div>
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
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
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
                value={step}
                // onChange={(e) => setSteps(steps.map((s, i) => i === stepIndex ? { ...s, text: e.target.value } : s ))}
                onChange={(e) =>
                  handleStepChange(stepIndex, e.target.value)
                }
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

              {/* Step Images */}
              {/* <div className={poststyles.picturesPreviewContainer}>
                {step.images.map((img, imageIndex) => (
                  <div key={imageIndex} className={poststyles.pictureContainer}>
                    <img
                      id={`Step picture ${imageIndex + 1}`}
                      value={step.img}
                      src={URL.createObjectURL(img)}
                      alt={`Step picture ${imageIndex + 1}`}
                      className={poststyles.picturePreview}
                    />
                    <div className={poststyles.pictureActions}>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveStepImage(stepIndex, imageIndex)
                        }
                        className={poststyles.removePictureButton}
                      >
                        <img
                          src={trashIcon}
                          alt="Remove"
                          className={poststyles.actionIcon}
                        />{" "}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(
                              `picture-${(stepIndex, imageIndex)}`
                            )
                            .click()
                        }
                        className={poststyles.reuploadPictureButton}
                      >
                        <img
                          src={cameraIcon}
                          alt="Reupload"
                          className={poststyles.actionIcon}
                        />{" "}
                      </button>
                    </div>
                  </div>
                ))}
                <div
                  className={poststyles.stepImagemagePreviewContainer}
                  onClick={() => handleStepImageChange(stepIndex)}
                  style={{
                    cursor: "pointer",
                    border: "1px dashed #ccc",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={cameraIcon}
                    alt="Add Step Pictures"
                    style={{ width: "30px", height: "30px" }}
                  />
                  <div> + Add Step Pictures</div>
                </div>
                <input
                  type="file"
                  id={`stepImages-${stepIndex}`}
                  multiple
                  accept="image/*"
                  onChange={(e) => handleStepImagesUpload(stepIndex, e)}
                  style={{ display: "none" }}
                />
              </div> */}
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
          <button type="submit" className={poststyles.submitButton}>
            Submit Recipe
          </button>
          <button type="cancel" className={poststyles.cancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
