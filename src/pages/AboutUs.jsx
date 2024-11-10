import React from 'react';
import aboutUsStyles from '../Components/css/AboutUs.module.css';

const AboutUs = () => {
  return (
    <div className={aboutUsStyles.container}>
      {/* About Us Section */}
      <section className={aboutUsStyles.aboutSection}>
        <h1 className={aboutUsStyles.heading}>About Us</h1>
        <p className={aboutUsStyles.text}>
          Welcome to our platform! We are dedicated to bringing you the best experience.
          Our mission is to create a community where you can share, explore different genre recipe with the others.
        </p>
        <p className={aboutUsStyles.text}>
          Our team is passionate about creating high-quality content and ensuring
          that our platform is always improving. We value our users and are committed
          to providing a space where everyone feels welcome and appreciated.
        </p>
        <h2 className={aboutUsStyles.subheading}>Our Vision</h2>
        <p className={aboutUsStyles.text}>
          We envision a world where everyone can connect and share experiences with ease.
          We’re constantly working to bring this vision to life by creating features that
          cater to your needs and make your experience seamless.
        </p>
      </section>

      {/* Contact Us Section */}
      <section className={aboutUsStyles.contactSection}>
        <h1 className={aboutUsStyles.heading}>Contact Us</h1>
        <p className={aboutUsStyles.contactText}>
          We'd love to hear from you! If you have any questions, feedback, or just want to
          say hello, please reach out to us via any of the following methods:
        </p>
        <p className={aboutUsStyles.contactInfo}>
          <strong>Email:</strong> support@gmail.com
        </p>
        <p className={aboutUsStyles.contactInfo}>
          <strong>Phone:</strong> +60 (12) 345-6789
        </p>
        <p className={aboutUsStyles.contactInfo}>
          <strong>Address:</strong> 83-21, Wangsimni-ro, Seongsu-dong, Seongdong-gu, Seoul, South Korea
        </p>
        <p className={aboutUsStyles.contactInfo}>
          <strong>Follow us on:</strong> 
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            Twitter
          </a> | 
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            Instagram
          </a> | 
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
