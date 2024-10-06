const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt'); 
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
// const router = express.Router();
const port = 3005;

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

app.use(session({
  secret: 'SecretKey', // Replace with a strong, secure key
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set true if using HTTPS
    httpOnly: true, // Helps prevent cross-site scripting attacks
    maxAge: 1000 * 60 * 60 * 24 // 1-day session duration
  }
}));

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.use(cors({
//   origin: "http://localhost:5173",  // Update with your frontend URL
//   credentials: true  // Allow credentials (cookies) to be sent
// }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup for multer to handle file uploads
const profileStorage  = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-pictures/');  // Directory to save the file
  },
  filename: (req, file, cb) => {
    console.log('Original filename:', file.originalname);
    cb(null, file.originalname);
    // cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));  // Save with original filename
  }
});

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/post-images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadProfile = multer({ storage: profileStorage });
const uploadPost = multer({ storage: postStorage }).fields([
  {name: 'coverImage', maxCount: 1},
  {name: 'pictures[]', maxCount: 10}
]);

app.use(express.json());

// app.get('/signup', (req, res) => {
//   res.json(req.body); 
// })

// Sign up route
app.post('/signup', async (req, res) => {
  console.log("Sign up request received");
  const { name, email, password } = req.body;

  // Validate the input
  if (!name || !email || !password) {
    console.log('All fields are required');
    return res.status(300).json({ message: 'All fields are required' });
  }

  console.log('Attempting to sign up with:', name, email, password);

  // Check if email already exists
  db.query('SELECT * FROM user_acc WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Error checking email: ', err);
      return res.status(100).json({ message: 'Server error' });
    }

    // Success: If no existing user with the same email, register the user
    if (results.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into the database
      db.query(
        'INSERT INTO user_acc (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error('Error inserting user: ', err);
            return res.status(400).json({ message: 'Server error' });
          }
          console.log('User registered successfully');
          return res.status(200).json({ message: 'User registered successfully' });
        }
      );
    } else {
      // Failure: User already exists
      console.log('User already exists:', email);
      return res.status(500).json({ message: 'Email already in use' });
    }
  });
});

app.get('/signin', (req, res) => {
  res.json(req.session.userId);  
})

// Sign In Route
app.post('/signin', async (req, res) => {
  console.log("Sign in request received");
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Email and password are required');
    return res.status(301).json({ message: 'Email and password are required' });
  }

  // Logging to debug
  console.log('Attempting to sign in with:', email, password);

  // SQL query to check user credentials
  const query = 'SELECT * FROM user_acc WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);  // Log the exact SQL error
      return res.status(100).json({ message: 'Internal server error' });
    }

    // Success: User found, check password
    if (results.length > 0) {
      const user = results[0];

      // const passwordMatch = await bcrypt.compare(password, user.password);
      // console.log(password);
      // console.log(user.password);
      if (password === user.password) {
        console.log('Sign-in successful for user:', email);
        
        // **SET the user ID in the session**
        req.session.userId = user.user_id;
        console.log('User signed in with ID12321:', req.session.userId);  // Make sure this is printed
        return res.status(201).json({ message: 'Sign-in successful!' });
      } else {
        console.log('Invalid password for user:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      console.log('No user found with email:', email);
      return res.status(501).json({ message: 'User not found' });
    }
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');  // Clear the session cookie
    return res.status(200).json({ message: 'Logout successful' });
  });
});

////////////////////////
// Route to check if user is authenticated
app.get('/check-auth', (req, res) => {
  console.log('Session at /check-auth:', req.session);
  //console log got
  console.log("Session user id = :", req.session.userId);
  if (req.session.userId) {
    res.status(201).json({ isAuthenticated: true, userId: req.session.userId });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

// Middleware to check if user is authenticated for protected routes
const isAuthenticated = (req, res, next) => {
  console.log('Session in isAuthenticated12321:', req.session);  
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized123' });
  }
};

// Example of a protected route
app.get('/profile', isAuthenticated, (req, res) => {
  console.log('User ID in session12321:', req.session.userId); 
  const userId = req.session.userId;
  const sql = 'SELECT name, email FROM user_acc WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(400).json({ message: 'Server error' });
    }
    res.status(201).json(result[0]);
  });
});
///////////////////////

// API Route to get user data
app.get('/profile/:id', (req, res) => {
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
app.put('/profile/:id', uploadProfile.single('profilePicture'), (req, res) => {
  console.log("File uploadProfile details:", req.file);
  const userId = req.params.id;
  const { name, email, password } = req.body;
  const profilePicture = req.file ? req.file.originalname : null;  // Get the original filename

  const sql = 'UPDATE user_acc SET name = ?, email = ?, password = ?, profilePicture = ? WHERE user_id = ?';
  db.query(sql, [name, email, password, profilePicture, userId], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send('Profile updated successfully');
    }
  });
});

// // Route to handle post creation
// app.post('/create-post', uploadPost.fields([{ name: 'coverImage' , maxCount: 1}, { name: 'pictures' }]), async (req, res) => {
//   const { title, recipeTime, description, steps } = req.body;
//   const userId = req.session.userId; // Assuming you have session-based auth

//   console.log('Post data:', { title, recipeTime, description, userId, steps });


//   // Save the post details in the database
//   connection.query(
//     'INSERT INTO post (userId, title, recipeTime, description, coverImage) VALUES (?, ?, ?, ?, ?)',
//     [userId, title, recipeTime, description, req.files?.coverImage ? req.files.coverImage[0].filename : null],
//     (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Failed to save post' });
//       }

//       const postId = results.insertId;

//       // Insert steps into a separate table
//       steps.forEach((step, index) => {
//         connection.query(
//           'INSERT INTO post_steps (postId, stepNumber, stepDescription) VALUES (?, ?, ?)',
//           [postId, index + 1, step],
//           (stepErr) => {
//             if (stepErr) {
//               console.error(stepErr);
//               return res.status(500).json({ error: 'Failed to save steps' });
//             }
//           }
//         );
//       });

//       // Handle additional pictures (if any)
//       if (req.files.pictures) {
//         req.files.pictures.forEach((file) => {
//           connection.query(
//             'INSERT INTO post_pictures (postId, pictureFilename) VALUES (?, ?)',
//             [postId, file.filename],
//             (pictureErr) => {
//               if (pictureErr) {
//                 console.error(pictureErr);
//                 return res.status(500).json({ error: 'Failed to save pictures' });
//               }
//             }
//           );
//         });
//       }

//       return res.status(201).json({ message: 'Post created successfully' });
//     }
//   );
// });

// Route to handle post creation
app.post('/create-post', uploadPost, async (req, res) => {
  const { title, recipeTime, description, steps } = req.body;
  const userId = req.session.userId; // Assuming user is authenticated and session contains userId

  // const coverImage = req.files['coverImage'] ? req.files.coverImage[0].filename : null
  const coverImage = req.files.coverImage ? req.files.coverImage[0].filename : null; // Get the uploaded cover image file name
  const pictures = req.files['pictures[]'] ? req.files['pictures[]'].map(file => file.filename) : [];

  console.log('Files received: ', req.files);

  // Insert into the `post` table
  // const postQuery = `INSERT INTO post (user_id, title, recipe_time, description, cover_image) 
  //                     VALUES (?, ?, ?, ?, ?)`;

  // const connection = await createPool.getConnection();
  try {
    // await db.beginTransaction();

    // const [result] = await db.execute(postQuery, [userId, title, recipeTime, description, coverImage]);
    const [result] = await db.query(
      `INSERT INTO post (user_id, title, recipe_time, description, cover_image, post_date) VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, title, recipeTime, description, coverImage]
    );
    
    const postId = result.insertId;

    // Insert steps into `recipe_steps`
    if (steps && steps.length > 0) {
      const stepQueries = steps.map((step, index) => {
        return db.query(
          'INSERT INTO recipe_steps (post_id, step_number, step_text) VALUES (?, ?, ?)',
          [postId, index + 1, step]
        );
      });
      await Promise.all(stepQueries); // Execute all step insert queries
    }

    // Insert pictures into `recipe_pictures`
    if (pictures && pictures.length > 0) {
      const pictureQueries = pictures.map(picture => {
        return db.query(
          'INSERT INTO recipe_pictures (post_id, picture) VALUES (?, ?)',
          [postId, picture]
        );
      });
      await Promise.all(pictureQueries); // Execute all picture insert queries
    }

    res.status(201).send('Post created successfully!');
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Error creating post');
  }
});



// app.post('/create-post', uploadPost.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'pictures', maxCount: 10 }]),  (req, res) => {
// // app.post('/create-post', uploadPost.single('coverImage'), (req, res) => {
// // app.put('/create-post', (req, res) => {
//   try {
//     const userId = req.session.userId; // Get the user ID from the session
//     if (!userId) {
//       return res.status(401).json({ error: 'User not authenticated' });
//     }

//     const { title, recipeTime, description } = req.body;
//     const coverImage = req.file ? req.file.filename : null; // Handle cover image upload
//     const additionalPictures = req.files['pictures'] ? req.files['pictures'].map(file => file.filename) : []; // Handle additional pictures
//     const steps = req.body.steps; // Steps will come as an array

//     if (!title || !recipeTime || !description || !coverImage) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Insert post into post table
//     const postQuery = 'INSERT INTO post (user_id, title, post_date, recipe_time, cover_image, description, pictures) VALUES (?, ?, NOW(), ?, ?, ?, ?)';
//     db.query(postQuery, [userId, title, recipeTime, coverImage, description, JSON.stringify(additionalPictures)], (err, result) => {
//       if (err) {
//         console.error('Error saving post to database:', err);
//         return res.status(500).json({ error: 'Error saving post to database' });
//       }

//       const postId = result.insertId; // Get the ID of the newly inserted post

//       if (steps) {
//         const stepQuery = 'INSERT INTO recipe_steps (post_id, step_number, step_text) VALUES ?';
//         const stepData = steps.map((step, index) => [postId, index + 1, step]);

//         db.query(stepQuery, [stepData], (err, result) => {
//           if (err) {
//             console.error('Error saving steps:', err);
//             return res.status(500).json({ error: 'Error saving steps' });
//           }
//           return res.status(201).json({ message: 'Post created successfully with steps' });
//         });
//       } else {
//         res.status(200).json({ message: 'No steps?!?' });
//       }
//     });
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

app.get('/create-post', (req, res) => {
  res.json(req.session.userId);
})

app.get('/get-post/:id', (req, res) => {
  const postId = req.params.id;

  //Fetch post with steps (join for 2 table (foreign key))
  const query = `
    SELECT p.*, s.step_number, s.step_text 
    FROM post p 
    LEFT JOIN recipe_steps s ON p.post_id = s.post_id
    WHERE p.post_id = ?
    ORDER BY s.step_number;
  `;

  db.query(query, [postId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      // The first row contains the post details, and the subsequent rows contain steps
      const post = {
        post_id: results[0].post_id,
        title: results[0].title,
        recipe_time: results[0].recipe_time,
        description: results[0].description,
        cover_image: results[0].cover_image,
        steps: results.map(row => ({
          step_number: row.step_number,
          step_text: row.step_text
        }))
      };
      
      return res.status(200).json(post);
    } else {
      return res.status(404).json({ message: 'Post not found' });
    }
  });
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});