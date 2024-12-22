import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import exploreStyles from "../Components/css/Explore.module.css";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [startX, setStartX] = useState(0); // Track starting x-coordinate for swiping
  const navigate = useNavigate();
  const refreshPage = () => {
    window.location.reload();
  }

  const sliderSettings = {
    // dots: true,
    // infinite: true,
    // speed: 500,
    // slidesToShow: 3, // Show 3 slides per page
    // slidesToScroll: 1,
    slidesToShow: 3,
    centerMode: true,
    centerPadding: "40px",
    arrows: true,
    infinite: true,
    focusOnSelect: true, // Enables click-to-navigate
    swipeToSlide: true, // Allows swipe without triggering click
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "20px",
        },
      },
    ],
  };

  const latestPosts = posts.filter(post => post.post_id).slice(0, 7); // Only posts with valid post_id for the carousel
  const remainingPosts = posts.filter(post => post.post_id).slice(7);  // Filter remaining posts with valid post_id
  // const latestPosts = posts.slice(0, 7);  // Top 7 posts for the carousel
  // const remainingPosts = posts.slice(7);  // Remaining posts for the grid

 // Detect click vs swipe by measuring the distance
 const handleMouseDown = (e) => setStartX(e.clientX);
 const handleMouseUp = (e, post_id) => {
   const endX = e.clientX;
   if (Math.abs(startX - endX) < 10 && post_id) {
     navigate(`/post/${post_id}`);
   }
 };

 // For touch events (on mobile)
 const handleTouchStart = (e) => setStartX(e.touches[0].clientX);
 const handleTouchEnd = (e, post_id) => {
   const endX = e.changedTouches[0].clientX;
   if (Math.abs(startX - endX) < 10 && post_id) {
     navigate(`/post/${post_id}`);
   }
 };

  const handlePostClick = (post_id) => {
        console.log("Clicked post ID:", post_id); // Log postId to debug
        if (post_id) {
            navigate(`/post/${post_id}`); // Redirect only if postId exists
        } else {
            console.error("Post ID is undefined!"); // Add error log if undefined
        }
    };

  // useEffect(() => {
  //   fetch("http://localhost:3005/posts")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // console.log(data);
  //       setPosts(data);
  //     })
  //     .catch((error) => console.error("Error fetching error: ", error));
  // }, []);

  useEffect(() => {
  fetch('http://localhost:3005/explore-posts')
    .then(response => response.json())
    .then(data => {
      // console.log('Received posts:', data); // Check if post_id is part of the response
      setPosts(data); // Set the posts data to state
    })
    .catch(error => console.error('Error fetching posts:', error));
}, []);


  useEffect(() => {
    // console.log(posts); // Log the posts array to verify post_id
  }, [posts]);

  return (
    <div className={exploreStyles.exploreContainer}>
      
      {/* Carousel Slider for 7 Most Recent Posts */}
      <Slider {...sliderSettings} className={exploreStyles.carouselContainer}>
        {latestPosts.map((post,index) => (
          <div key={index} className={exploreStyles.carouselSlide}>
            <img
              src={`http://localhost:3005/uploads/post-images/${post.cover_image}`}
              alt={post.title}
              className={exploreStyles.coverImage}
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => handleMouseUp(e, post.post_id)}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, post.post_id)}
              style={{cursor: 'pointer'}}
            />
            {/* <img
              src={`http://localhost:3005/uploads/post-images/${post.cover_image}`}
              alt={post.title}
              className={exploreStyles.coverImage}
              onClick={() => handlePostClick(post.post_id)}
            /> */}
            {/* <h3>{post.title}</h3> */}
          </div>
        ))}
      </Slider>
      <br/>

      <h1>Explore Recipes</h1>
      <div className={exploreStyles.postsGrid}>
        {remainingPosts.length > 0 ? (
          remainingPosts.map((post, index) => (
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
          <div>
            <h1>No posts found.</h1>
            <h2>Refresh the page if you think this is an error.</h2>
            <button onClick ={refreshPage}>Refresh</button>
          </div>

        )}
      </div>
    </div>
  );
};

export default Explore;
