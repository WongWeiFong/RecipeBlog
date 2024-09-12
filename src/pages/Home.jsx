import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../Components/css/Home.css';
// import homestyles from '../Components/css/Home.module.css';
import video1 from '../assets/video1.mp4';
import food from '../assets/food.jpg';
import food1 from '../assets/food1.jpg';
import food2 from '../assets/food2.jpg';
import next_icon from '../assets/next_icon.png';
import play_icon from '../assets/play_icon.png';
import pause_icon from '../assets/pause_icon.png';

const Home = () => {
  const heroData = [
    { text1: "Fresh", text2: "Strawberries" },
    { text1: "Nutrient", text2: "Mixture" },
    { text1: "Healthy", text2: "Grapefruit" },
  ];

  const [heroCount, setHeroCount] = useState(0);
  const [playStatus, setPlayStatus] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroCount((count) => (count === 2 ? 0 : count + 1));
    }, 3000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="home-container">
      <div className="hero">
        <div className="hero-text">
          <p>{heroData[heroCount].text1}</p>
          <p>{heroData[heroCount].text2}</p>
        </div>
        <div className="hero-explore">
          <p>Explore the features</p>
          <img src={next_icon} alt="Explore" onClick={() => navigate('/explore')} />
        </div>
        <div className="hero-dot-play">
          <ul className="hero-dots">
            <li onClick={() => setHeroCount(0)} className={heroCount === 0 ? "hero-dot orange" : "hero-dot"}></li>
            <li onClick={() => setHeroCount(1)} className={heroCount === 1 ? "hero-dot orange" : "hero-dot"}></li>
            <li onClick={() => setHeroCount(2)} className={heroCount === 2 ? "hero-dot orange" : "hero-dot"}></li>
          </ul>
          <div className="hero-play">
            <img
              onClick={() => setPlayStatus(!playStatus)}
              src={playStatus ? pause_icon : play_icon}
              alt={playStatus ? "Pause" : "Play"}
            />
            <p>Watch the video</p>
          </div>
        </div>
      </div>

      {/* Background Section */}
      {playStatus ? (
        <video className="background fade-in" autoPlay loop muted>
          <source src={video1} type="video/mp4" />
        </video>
      ) : (
        <img
          src={heroCount === 0 ? food : heroCount === 1 ? food1 : food2}
          className="background fade-in" alt="Background"
        />
      )}
    </div>
  );
};

export default Home;

// const Home = () => {
//   const heroData = [
//   { text1: "Fresh", text2: "Strawberries" },
//   { text1: "Nutrient", text2: "Mixture" },
//   { text1: "Healthy", text2: "Grapefruit" },
// ];

// const [heroCount, setHeroCount] = useState(0);
// const [playStatus, setPlayStatus] = useState(false);
// const navigate = useNavigate(); 

// useEffect(() => {
//   const interval = setInterval(() => {
//     setHeroCount((count) => (count === 2 ? 0 : count + 1));
//   }, 3000);

//   return () => clearInterval(interval); // Cleanup interval on component unmount
// }, []);
//   return (
//     <div className={homestyles["home-container"]}>
//       <div className={homestyles["hero"]}>
//         <div className={homestyles["hero-text"]}>
//           <p>{heroData[heroCount].text1}</p>
//           <p>{heroData[heroCount].text2}</p>
//         </div>
//         <div className={homestyles["hero-explore"]}>
//           <p>Explore the features</p>
//           <img src={next_icon} alt="Explore" onClick={() => navigate('/explore')} />
//         </div>
//         <div className={homestyles["hero-dot-play"]}>
//           <ul className={homestyles["hero-dots"]}>
//             <li onClick={() => setHeroCount(0)} className={heroCount === 0 ? homestyles["hero-dot"] + "" + homestyles["orange"] : homestyles["hero-dot"]}></li>
//             <li onClick={() => setHeroCount(1)} className={heroCount === 1 ? homestyles["hero-dot"] + "" + homestyles["orange"] : homestyles["hero-dot"]}></li>
//             <li onClick={() => setHeroCount(2)} className={heroCount === 2 ? homestyles["hero-dot"] + "" + homestyles["orange"] : homestyles["hero-dot"]}></li>
//           </ul>
//           <div className={homestyles["hero-play"]}>
//             <img
//               onClick={() => setPlayStatus(!playStatus)}
//               src={playStatus ? pause_icon : play_icon}
//               alt={playStatus ? "Pause" : "Play"}
//             />
//             <p>Watch the video</p>
//           </div>
//         </div>
//       </div>

//       {/* Background Section */}
//       {playStatus ? (
//         <video className={homestyles["background fade-in"]} autoPlay loop muted>
//           <source src={video1} type="video/mp4" />
//         </video>
//       ) : (
//         <img
//           src={heroCount === 0 ? food : heroCount === 1 ? food1 : food2}
//           className={homestyles["background fade-in"]} alt="Background"
//         />
//       )}
//     </div>
//   );
// };

// export default Home;
