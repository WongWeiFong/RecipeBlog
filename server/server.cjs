const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3005;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'recipeblog',
  port: 3307
});

db.connect((err) => {
  if (err) {
    console.log('Database connection failed', err);
  } else {
    console.log('Connected to the database');
  }
});

// API Route to get user data
app.get('/profile/:id', (req, res) => {
  console.log("123");
  const userId = req.params.id;
  const sql = 'SELECT name, email, password, profilePicture FROM user_acc WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result[0]);
    }
  });
});

// API Route to update user data
app.put('/profile/:id', (req, res) => {
  console.log("12345");
  const userId = req.params.id;
  const { name, email, password, profilePicture } = req.body;
  const sql = 'UPDATE user_acc SET name = ?, email = ?, password = ?, profilePicture = ? WHERE user_id = ?';
  
  db.query(sql, [name, email, password, profilePicture, userId], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send('Profile updated successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
