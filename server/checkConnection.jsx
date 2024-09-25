import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const checkConnection = () => {

  const navigate = useNavigate();

  // Check if the user is authenticated and get the user ID from session
  const checkAuth = () => {
   fetch('http://localhost:3005/check-auth',{
   method: "GET",
   credentials: "include",
   })
     .then(response => response.json())
     // .then(data =>console.log(data))
     .then(data => {
       console.log("authentication dataaaaaaaaL:",data);
       if (data.isAuthenticated) {
         setUserId(data.userId);  // Set the userId from the session
       } else {
         // If not authenticated, redirect to sign-in page
         alert("Please sign in your account first");
         navigate('/signinup');
       }
     })
     .catch(error => console.error('Error checking authentication: ', error));
 };

 useEffect(() => {
    checkAuth();  // Check authentication on component mount
  }, []);

  
}

export default checkConnection;
