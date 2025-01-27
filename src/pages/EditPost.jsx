import React, { useEffect, useState } from "react";
import poststyles from "../Components/css/CreatePost.module.css";
import trashIcon from "../assets/trash.png";
import cameraIcon from "../assets/camera.png";
import { useNavigate, useParams } from "react-router-dom";

const EditPost = () => {
  const [userId, setUserId] = useState(null);
  const [postCreatorId, setPostCreatorId] = useState(null);

  const [title, setTitle] = useState("");
  const [recipeTime, setRecipeTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [coverImage, setCoverImage] = useState(null);
  const [steps, setSteps] = useState([""]);
  const [coverPreview, setCoverPreview] = useState(null);

  const [picturesPreview, setPicturesPreview] = useState([]);
  const [removedPictures, setRemovedPictures] = useState([]);
  const [newPictures, setNewPictures] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [notAuthorized, setNotAuthorized] = useState(false);

  const navigate = useNavigate();
  const { postId } = useParams();

  // 1) Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Define the function *outside* of useEffect, so it’s reusable
  const fetchPostData = async (id) => {
    try {
      console.log("Fetching post data...");
      const response = await fetch(`http://localhost:3005/editpost/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      console.log("Fetched data:", data);

      if (response.ok) {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setCoverPreview(
          data.cover_image
            ? `/server/uploads/post-images/${data.cover_image}`
            : null
        );
        setRecipeTime(data.recipe_time.split(" ")[0] || "");
        setTimeUnit(data.recipe_time.split(" ")[1] || "minutes");
        setIngredients(data.ingredients || [""]);
        setSteps(data.steps || [""]);

        // store the post's creator ID
        setPostCreatorId(data.user.user_id);
        console.log("Post creator ID:", data.user.user_id);

        if (data.pictures && data.pictures.length > 0) {
          const existingPics = data.pictures.map((pic) => ({
            url: `/server/uploads/post-images/${pic.picture}`,
            isExisting: true,
            filename: pic.picture,
          }));
          setPicturesPreview(existingPics);
        } else {
          setPicturesPreview([]);
        }
      } else {
        console.error("Error fetching post:", data.message);
      }
    } catch (error) {
      console.error("Error in fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2) Fetch the post data once we have a postId
  useEffect(() => {
    if (postId) {
      fetchPostData(postId);
    }
  }, [postId]);

  // 3) Compare userId and postCreatorId
  useEffect(() => {
    if (userId && postCreatorId && userId !== postCreatorId) {
      setNotAuthorized(true);
    }
  }, [userId, postCreatorId]);

  // 4) Check Auth function
  const checkAuth = () => {
    fetch("http://localhost:3005/check-auth", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Auth data:", data);
        if (data.isAuthenticated) {
          setUserId(data.userId);
        } else {
          alert("Please sign in before editing posts");
          navigate("/signinup");
        }
      })
      .catch((error) => console.error("Error checking authentication: ", error));
  };

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      picturesPreview.forEach((pic) => {
        if (!pic.isExisting) {
          URL.revokeObjectURL(pic.url);
        }
      });
    };
  }, [picturesPreview]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (notAuthorized) {
    return (
      <div className={poststyles.notAuthorizedContainer}>
        <div className={poststyles.notAuthorizedBox}>
          <p className={poststyles.notAuthorizedMessage}>
            Error: You are not authorized to edit this post.
          </p>
        </div>
      </div>
    );
  }

  if (!title && !description) {
    return (
     <div className={poststyles.notAuthorizedContainer}>
        <div className={poststyles.notAuthorizedBox}>
          <p className={poststyles.notAuthorizedMessage}>
          Error: Unable to load post data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // --- Handlers ------------------------------------------------
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

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
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleStepChange = (e, index) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = e.target.value;
    setSteps(updatedSteps);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handlePicturesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    setPicturesPreview((prev) => [...prev, ...newPreviews]);
    setNewPictures((prev) => [...prev, ...files]);
  };

  const handleRemovePicture = (index) => {
    const pictureToRemove = picturesPreview[index];

    // If it was an existing picture on the server
    if (pictureToRemove.isExisting) {
      setRemovedPictures((prev) => [...prev, pictureToRemove.filename]);
    }
    // Remove from local preview
    setPicturesPreview((prev) => prev.filter((_, i) => i !== index));

    // If it's a newly added picture, remove it from newPictures as well
    if (!pictureToRemove.isExisting && pictureToRemove.file) {
      setNewPictures((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // --- Submitting (PUT request) --------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("recipeTime", `${recipeTime} ${timeUnit}`);
    formData.append("description", description);
    formData.append("coverImage", coverImage);

    ingredients.forEach((ingredient, index) => {
      formData.append(`ingredients[${index}]`, ingredient);
    });

    steps.forEach((step, index) => {
      formData.append(`steps[${index}]`, step);
    });

    newPictures.forEach((picture) => {
      formData.append("pictures", picture);
    });

    removedPictures.forEach((pic) => {
      formData.append("removedPictures[]", pic);
    });

    try {
      const response = await fetch(`http://localhost:3005/posts/${postId}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      // Only call response.json() once:
      const data = await response.json();

      if (response.ok) {
        alert("Post updated successfully!");
        navigate(`/myrecipe`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during updating recipe:", error);
      alert("An error occurred while updating the recipe.");
    }
  };

  // --- JSX -----------------------------------------------------
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
          <div
            className={poststyles.alignment}
            onClick={() => document.getElementById("coverImage").click()}
            style={{ cursor: "pointer" }}
          >
            <div className={poststyles.imagePreviewContainer}>
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div>Click to upload an image</div>
              )}
            </div>
          </div>
          <input
            type="file"
            id="coverImage"
            accept="image/*"
            onChange={handleCoverImageChange}
            style={{ display: "none" }}
          />
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
                type="text"
                placeholder="Enter ingredient"
                value={ingredient}
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
                Step {stepIndex + 1}
              </label>
              <textarea
                id={`step-${stepIndex + 1}`}
                value={step}
                onChange={(e) => handleStepChange(e, stepIndex)}
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
            + Add Step
          </button>
        </div>
        <br />

        {/* Additional Pictures */}
        <div className={poststyles.formGroup}>
          <label>Additional Pictures:</label>
          <div className={poststyles.picturesPreviewContainer}>
            {picturesPreview.map((pic, index) => (
              <div key={index} className={poststyles.pictureContainer}>
                <img
                  src={pic.url}
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
                    />
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
                    />
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
          {/* "Add More Pictures" area */}
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
            />
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
