import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Explore from "./pages/Explore";
// import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import SignInUp from "./pages/SignInUp";
import CreatePost from "./pages/CreatePost";
import PostList from "./pages/PostList";
import PostDetails from "./pages/PostDetails";
import EditPost from "./pages/EditPost";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={ <Home /> } />
        <Route path="/explore" element={<Explore />} />
        <Route path="/aboutus" element={<AboutUs />} />
        {/* <Route path="/contact" element={<Contact />} /> */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/signinup" element={<SignInUp />} />
        <Route path="/createpost" element={<CreatePost/>} />
        <Route path="/myrecipe" element={<PostList/>} />
        <Route path="/post/:id" element={<PostDetails/>} />
        <Route path="/editpost/:postId" element={<EditPost/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
