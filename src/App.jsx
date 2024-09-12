import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Explore from "./pages/Explore";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import SignInUp from "./pages/SignInUp";

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
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signinup" element={<SignInUp />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
