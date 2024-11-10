import React, { useState } from 'react';
import contactStyles from '../Components/css/Contact.module.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you soon.');
    // Add API call or email logic here
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className={contactStyles.container}>
      <h1 className={contactStyles.heading}>Contact Us</h1>
      <form onSubmit={handleSubmit} className={contactStyles.form}>
        <label className={contactStyles.label}>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={contactStyles.input}
            required
          />
        </label>
        <label className={contactStyles.label}>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={contactStyles.input}
            required
          />
        </label>
        <label className={contactStyles.label}>
          Message:
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={contactStyles.textarea}
            rows="5"
            required
          />
        </label>
        <button type="submit" className={contactStyles.button}>Send Message</button>
      </form>
    </div>
  );
};

export default Contact;
