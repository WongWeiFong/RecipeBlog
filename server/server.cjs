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
    cb(null, file.originalname);
  }
});

const uploadProfile = multer({ storage: profileStorage });
const uploadPost = multer({ storage: postStorage });
// .fields([
//   { name: 'coverImage', maxCount: 1},
//   { name: 'pictures', maxCount: 10}
// ]);

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

app.post('/create-post', uploadPost.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'pictures', maxCount: 10 }]), async (req, res) => {
// app.post('/create-post', uploadPost.fields({ name: 'coverImage', maxCount: 1 }), (req, res) => {
// app.post('/create-post', (req, res) => {

    const userId = req.session.userId; // Get the user ID from the session
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('Files received:', req.files); // Log to check if files are received


    const { title, recipeTime, description } = req.body;
    // const coverImage = req.file ? req.file.filename : null; // Handle cover image upload
    const coverImage = req.files.coverImage ? req.files.coverImage.map(file => file.filename) : null;
    const ingredients = req.body.ingredients; // Steps will come as an array
    const steps = req.body.steps; // Steps will come as an array
    const pictures = req.files.pictures ? req.files.pictures.map(file => file.filename) : []
    // const pictures = req.body.pictures;
    
    if (!title) {
      return res.status(400).json({ error: 'No title?' });
    } else if (!recipeTime) {
      return res.status(400).json({ error: 'no time?' });
    } else if (!description) {
          return res.status(400).json({ error: 'no description?' });
    } else if (!coverImage) {
      return res.status(400).json({ error: 'no cover image?' });
    }

    // if (!title || !recipeTime || !description || !coverImage) {
    //   return res.status(400).json({ error: 'Missing required fields' });
    // }

    // Insert post into post table
    const postQuery = 'INSERT INTO post (user_id, title, post_date, recipe_time, cover_image, description) VALUES (?, ?, NOW(), ?, ?, ?)';
    db.query(postQuery, [userId, title, recipeTime, coverImage, description], (err, result) => {
      if (err) {
        console.error('Error saving post to database:', err);
        return res.status(500).json({ error: 'Error saving post to database' });
      }

      const postId = result.insertId; // Get the ID of the newly inserted post

      const ingredientPromise = new Promise((resolve, reject) => {
      if (ingredients && ingredients.length > 0) {
        const ingredientQuery = 'INSERT INTO recipe_ingredient (post_id, ingredient) VALUES ?';
        const ingredientData = ingredients.map((ingredient) => [postId, ingredient]);

        db.query(ingredientQuery, [ingredientData], (err) => {
          if (err) {
            console.error('Error saving ingredients:', err);
            return reject('Error saving ingredients');
            //return res.status(500).json({ error: 'Error saving steps' });
          }
          resolve();
          // return res.status(201).json({ message: 'Post created successfully with steps' });
        });
      } else {
        resolve(); //No steps to insert
        // res.status(200).json({ message: 'No steps?!?' });
      }
    });

    const stepPromise = new Promise((resolve, reject) => {
      if (steps && steps.length > 0) {
        const stepQuery = 'INSERT INTO recipe_steps (post_id, step_number, step_text) VALUES ?';
        const stepData = steps.map((step, index) => [postId, index + 1, step]);

        db.query(stepQuery, [stepData], (err) => {
          if (err) {
            console.error('Error saving steps:', err);
            return reject('Error saving steps');
            //return res.status(500).json({ error: 'Error saving steps' });
          }
          resolve();
          // return res.status(201).json({ message: 'Post created successfully with steps' });
        });
      } else {
        resolve(); //No steps to insert
        // res.status(200).json({ message: 'No steps?!?' });
      }
    });

    const picturePromise = new Promise((resolve, reject) => {
      if (pictures && pictures.length > 0) {
        const picQuery = 'INSERT INTO recipe_pictures (post_id, picture) VALUES ?';
        const picData = pictures.map((picture) => [postId, picture]);

        db.query(picQuery, [picData], (err) => {
          if(err) {
            console.error('Error saving pictures:', err);
            return reject('Error saving pictures');
            // return res.status(500).json({ error: 'Error saving pictures' });
          }
          resolve();
        });
      } else {
        resolve();
        // res.status(200).json({ message: 'No pictures?!?' });
      }
    });
    // Wait for both steps and pictures to complete
    Promise.all([ingredientPromise, stepPromise, picturePromise])
    .then(() => {
      res.status(201).json({ message: 'Post created successfully with ingredient, steps and pictures' });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
    });
});

// Inside server.cjs or appropriate route handler
app.get('/posts', (req, res) => {
  const query = 'SELECT title, cover_image, post_date FROM post ORDER BY post_date DESC'; // Query to fetch posts
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Error fetching posts' });
    }

    res.status(200).json(results); // Send the results to the front-end
  });
});

app.get('/create-post', (req, res) => {
  res.json(req.session.userId);
})

// In your server.cjs or appropriate route file
app.get('/post/:id', async (req, res) => {
  const postId = req.params.id;
  console.log(`Fetching post details for post_id11: ${postId}`); // Log post ID

  // Query to fetch post details, pictures, steps, and user info
  const query = `
    SELECT 
      p.post_id, p.title, p.recipe_time, p.description, p.cover_image, p.post_date, u.user_id, u.name,
      r.picture_id, r.picture, i.ingredient_id, i.ingredient,
      s.step_id, s.step_number, s.step_text
    FROM post p
    JOIN user_acc u ON p.user_id = u.user_id
    LEFT JOIN recipe_pictures r ON p.post_id = r.post_id
    LEFT JOIN recipe_ingredient i ON p.post_id = i.post_id
    LEFT JOIN recipe_steps s ON p.post_id = s.post_id
    WHERE p.post_id = ?`;

    db.query(query, [postId], (error, rows) => {
      if (error) {
        console.error('Error fetching post details:', error);
        return res.status(500).json({ message: 'Error fetching post details', error });
      }

    if (rows.length === 0) {
      console.error(`Post not found for post_id11: ${postId}`);
      return res.status(404).json({ message: 'Post not found111' });
    }

    // Organize the data for pictures and steps
    const post = {
      post_id: rows[0].post_id,
      title: rows[0].title,
      recipe_time: rows[0].recipe_time,
      description: rows[0].description,
      cover_image: rows[0].cover_image,
      post_date: rows[0].post_date,
      user: {
        user_id: rows[0].user_id,
        name: rows[0].name,
      },
      pictures: [],
      ingredients: [],
      steps: [],
    };

    rows.forEach(row => {
      if (row.picture) {
        post.pictures.push({
          picture_id: row.picture_id,
          picture: row.picture
        });
      }
      if (row.ingredient) {
        post.ingredients.push({
          ingredient_id: row.ingredient_id,
          ingredient: row.ingredient,
        });
      }
      if (row.step_text) {
        post.steps.push({
          step_id: row.step_id,
          step_number: row.step_number,
          step_text: row.step_text
        });
      }
    });

    res.status(200).json(post);
  
  })
});

/*
app.get('/post/:id', async (req, res) => {
  const postId = req.params.id;

  try {
      const [post] = await db.promise().query('SELECT * FROM post WHERE post_id = ?', [postId]);
      const [steps] = await db.promise().query('SELECT * FROM recipe_steps WHERE post_id = ? ORDER BY step_number', [postId]);
      const [pictures] = await db.promise().query('SELECT * FROM recipe_pictures WHERE post_id = ?', [postId]);

      if (post.length === 0) {
          return res.status(404).json({ error: 'Post not found' });
      }

      res.json({
          post: post[0],
          steps,
          pictures
      });
  } catch (err) {
      res.status(500).json({ error: 'Error retrieving post data' });
  }
});
*/

app.get('/explore-posts', (req, res) => {
  const sqlQuery = `SELECT post_id, user_id, title, cover_image, post_date FROM post ORDER BY post_date DESC`; // Ensure post_id is included
  
  db.query(sqlQuery, (err, result) => {
    if (err) {
      console.error('Error fetching posts:', err);
      res.status(500).send('Error fetching posts');
    } else {
      console.log(result); // Log the result to confirm post_id is being sent
      res.json(result); // Send the result to the frontend
    }
  });
});


/*
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

  connection.query(query, [postId], (err, results) => {
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
*/
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});