import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import postListStyles from '../Components/css/PostList.module.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState([null]);  // Set this to the authenticated user's ID
  const navigate = useNavigate();

  // Fetch posts created by the user
  const fetchUserPosts = () => {
    fetch(`http://localhost:3005/explore-posts/${userId}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setPosts(data || [] );  // Assuming backend returns an array of posts
      })
      .catch(error => console.error('Error fetching posts: ', error));
  };

  // Delete a post by ID
  const deletePost = (postId) => {
    fetch(`http://localhost:3005/explore-posts/delete/${postId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Post deleted successfully.');
          setPosts(posts.filter(post => post.id !== postId));  // Update posts list after deletion
        } else {
          alert('Failed to delete the post.');
        }
      })
      .catch(error => console.error('Error deleting post: ', error));
  };

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
    // Assuming userId is retrieved from context or authentication data
    // setUserId(1);  // Replace with actual authenticated user ID
    if (userId) {
      console.log("Fetching posts for userId:", userId); // Add this
      fetchUserPosts();
    }
  }, [userId]);

  return (
    <div className={postListStyles['post-list-container']}>
      <h2>User's Posts</h2>
      <table className={postListStyles['post-table']}>
        <thead>
          <tr>
            <th>No.</th>
            <th>Cover Image</th>
            <th>Title</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? (
          posts.map((post, index) => (
            <tr key={post.id}>
              <td>{index + 1}</td>
              <td>
                <img
                  src={`http://localhost:3005/uploads/post-images/${post.cover_image}`}
                  alt="Cover"
                  className={postListStyles['cover-image']}
                />
              </td>
              <td>{post.title}</td>
              <td>{new Date(post.post_date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => navigate(`/explore-posts/${post.id}`)}>View</button>
                <button onClick={() => deletePost(post.id)} className={postListStyles['delete-button']}>Delete</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">No posts found</td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  );
};

export default PostList;
