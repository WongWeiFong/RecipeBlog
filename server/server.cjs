const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt'); 
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Required for file operations

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
app.use(express.urlencoded({ extended: true }));

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
// app.get('/posts', (req, res) => {
//   const query = 'SELECT title, cover_image, post_date FROM post ORDER BY post_date DESC'; // Query to fetch posts
  
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching posts:', err);
//       return res.status(500).json({ error: 'Error fetching posts' });
//     }

//     res.status(200).json(results); // Send the results to the front-end
//   });
// });

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

app.get('/editpost/:id', async (req, res) => {
  const postId = req.params.id;
  console.log(`Fetching post details for post_id11: ${postId}`); // Log post ID

  // Query to fetch post details, pictures, steps, and user info
  const query = `
    SELECT 
      p.post_id, p.title, p.recipe_time, p.description, p.cover_image, p.post_date, u.user_id, u.name,
    GROUP_CONCAT(DISTINCT r.picture_id ORDER BY r.picture_id) AS picture_ids,
    GROUP_CONCAT(DISTINCT r.picture ORDER BY r.picture_id) AS pictures,
    GROUP_CONCAT(DISTINCT i.ingredient_id ORDER BY i.ingredient_id) AS ingredient_ids,
    GROUP_CONCAT(DISTINCT i.ingredient ORDER BY i.ingredient_id) AS ingredients,
    GROUP_CONCAT(DISTINCT s.step_id ORDER BY s.step_id) AS step_ids,
    GROUP_CONCAT(DISTINCT s.step_number ORDER BY s.step_id) AS step_numbers,
    GROUP_CONCAT(DISTINCT s.step_text ORDER BY s.step_id) AS step_texts
    FROM post p
    JOIN user_acc u ON p.user_id = u.user_id
    LEFT JOIN recipe_pictures r ON p.post_id = r.post_id
    LEFT JOIN recipe_ingredient i ON p.post_id = i.post_id
    LEFT JOIN recipe_steps s ON p.post_id = s.post_id
    WHERE p.post_id = ?
    GROUP BY p.post_id, p.title, p.recipe_time, p.description, p.cover_image, p.post_date, u.user_id, u.name
    ORDER BY s.step_number;`;

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
      pictures: rows[0].pictures ? rows[0].pictures.split(',').map(picture => ({ picture: picture })) : [],
      ingredients: rows[0].ingredients ? rows[0].ingredients.split(',') : [],
      steps: rows[0].step_texts ? rows[0].step_texts.split(',') : [],
      // pictures: rows[0].pictures ? rows[0].pictures.split(',').map(picture => ({ picture: picture })) : [],
      // ingredients: rows[0].ingredients.split(',').map(ingredient => ({ ingredient: ingredient })),
      // steps: rows[0].step_texts.split(',').map((step_text, index) => ({
      //   step_number: rows[0].step_numbers.split(',')[index],
      //   step_text: step_text,
      // }))
    };

    // rows.forEach(row => {
    //   if (row.picture) {
    //     post.pictures.push({
    //       picture_id: row.picture_id,
    //       picture: row.picture
    //     });
    //   }
    //   if (row.ingredient) {
    //     post.ingredients.push({
    //       ingredient_id: row.ingredient_id,
    //       ingredient: row.ingredient,
    //     });
    //   }
    //   if (row.step_text) {
    //     post.steps.push({
    //       step_id: row.step_id,
    //       step_number: row.step_number,
    //       step_text: row.step_text
    //     });
    //   }
    // });

    res.status(200).json(post);
  
  })
});

app.put('/posts/:id', uploadPost.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'pictures', maxCount: 10 }]), async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  // Extract fields from formData
  const { title, recipeTime, description } = req.body;
  const coverImage = req.files.coverImage ? req.files.coverImage[0].filename : null;
  const ingredients = req.body.ingredients || [];
  const steps = req.body.steps || [];
  const removedPictures = req.body.removedPictures || []; // Array of filenames to remove

  // Validation
  if (!title || !recipeTime || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!Array.isArray(ingredients) || !Array.isArray(steps)) {
    return res.status(400).json({ message: 'Ingredients and steps must be arrays.' });
  }

  // Begin Transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction Error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Step 1: Update the Post
    let updatePostQuery = 'UPDATE post SET title = ?, recipe_time = ?, description = ?';
    const updatePostValues = [title, recipeTime, description];

    if (coverImage) {
      updatePostQuery += ', cover_image = ?';
      updatePostValues.push(coverImage);
    }

    updatePostQuery += ' WHERE post_id = ? AND user_id = ?';
    updatePostValues.push(postId, userId);

    db.query(updatePostQuery, updatePostValues, (err, result) => {
      if (err) {
        console.error('Error Updating Post:', err);
        return db.rollback(() => {
          res.status(500).json({ message: 'Error updating post' });
        });
      }

      // Step 2: Delete Removed Pictures
      if (removedPictures.length > 0) {
        const deletePicturesQuery = 'DELETE FROM recipe_pictures WHERE post_id = ? AND picture IN (?)';
        db.query(deletePicturesQuery, [postId, removedPictures], (err, result) => {
          if (err) {
            console.error('Error Deleting Pictures:', err);
            return db.rollback(() => {
              res.status(500).json({ message: 'Error deleting pictures' });
            });
          }

          // Delete files from the server
          removedPictures.forEach((filename) => {
            const filePath = path.join(__dirname, 'uploads/post-images/', filename);
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`Error deleting file ${filename}:`, err);
                // Not throwing error here to allow transaction to continue
              } else {
                console.log(`Deleted file: ${filename}`);
              }
            });
          });

          proceedWithUpdate();
        });
      } else {
        proceedWithUpdate();
      }

      function proceedWithUpdate() {
        // Step 3: Update Ingredients
        // Delete existing ingredients and re-insert
        const deleteIngredientsQuery = 'DELETE FROM recipe_ingredient WHERE post_id = ?';
        db.query(deleteIngredientsQuery, [postId], (err, result) => {
          if (err) {
            console.error('Error Deleting Ingredients:', err);
            return db.rollback(() => {
              res.status(500).json({ message: 'Error updating ingredients' });
            });
          }

          if (ingredients.length > 0) {
            const insertIngredientsQuery = 'INSERT INTO recipe_ingredient (post_id, ingredient) VALUES ?';
            const ingredientData = ingredients.map((ingredient) => [postId, ingredient]);

            db.query(insertIngredientsQuery, [ingredientData], (err, result) => {
              if (err) {
                console.error('Error Inserting Ingredients:', err);
                return db.rollback(() => {
                  res.status(500).json({ message: 'Error updating ingredients' });
                });
              }

              proceedWithSteps();
            });
          } else {
            proceedWithSteps();
          }
        });

        // Step 4: Update Steps
        function proceedWithSteps() {
          // Delete existing steps and re-insert
          const deleteStepsQuery = 'DELETE FROM recipe_steps WHERE post_id = ?';
          db.query(deleteStepsQuery, [postId], (err, result) => {
            if (err) {
              console.error('Error Deleting Steps:', err);
              return db.rollback(() => {
                res.status(500).json({ message: 'Error updating steps' });
              });
            }

            if (steps.length > 0) {
              const insertStepsQuery = 'INSERT INTO recipe_steps (post_id, step_number, step_text) VALUES ?';
              const stepData = steps.map((step, index) => [postId, index + 1, step]);

              db.query(insertStepsQuery, [stepData], (err, result) => {
                if (err) {
                  console.error('Error Inserting Steps:', err);
                  return db.rollback(() => {
                    res.status(500).json({ message: 'Error updating steps' });
                  });
                }

                proceedWithPictures();
              });
            } else {
              proceedWithPictures();
            }
          });
        }

        // Step 5: Insert New Pictures
        function proceedWithPictures() {
          if (req.files.pictures && req.files.pictures.length > 0) {
            const insertPicturesQuery = 'INSERT INTO recipe_pictures (post_id, picture) VALUES ?';
            const pictureData = req.files.pictures.map((file) => [postId, file.filename]);

            db.query(insertPicturesQuery, [pictureData], (err, result) => {
              if (err) {
                console.error('Error Inserting Pictures:', err);
                return db.rollback(() => {
                  res.status(500).json({ message: 'Error adding new pictures' });
                });
              }

              // All operations successful, commit the transaction
              db.commit((err) => {
                if (err) {
                  console.error('Commit Error:', err);
                  return db.rollback(() => {
                    res.status(500).json({ message: 'Error committing transaction' });
                  });
                }

                res.status(200).json({ message: 'Post updated successfully' });
              });
            });
          } else {
            // No new pictures to add, commit the transaction
            db.commit((err) => {
              if (err) {
                console.error('Commit Error:', err);
                return db.rollback(() => {
                  res.status(500).json({ message: 'Error committing transaction' });
                });
              }

              res.status(200).json({ message: 'Post updated successfully' });
            });
          }
        }
      }
    });
  });
});

app.delete('/explore-posts/delete/:postId', (req, res) => {
  const { postId } = req.params;

  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ success: false, message: 'Transaction error' });
    }

    // Delete from recipe_ingredient
    db.query('DELETE FROM recipe_ingredient WHERE post_id = ?', [postId], (err) => {
      if (err) {
        console.error('Error deleting from recipe_ingredient:', err);
        return db.rollback(() => res.status(500).json({ success: false, message: 'Error deleting recipe ingredients' }));
      }

      // Delete from recipe_steps
      db.query('DELETE FROM recipe_steps WHERE post_id = ?', [postId], (err) => {
        if (err) {
          console.error('Error deleting from recipe_steps:', err);
          return db.rollback(() => res.status(500).json({ success: false, message: 'Error deleting recipe steps' }));
        }

        // Delete from recipe_pictures
        db.query('DELETE FROM recipe_pictures WHERE post_id = ?', [postId], (err) => {
          if (err) {
            console.error('Error deleting from recipe_pictures:', err);
            return db.rollback(() => res.status(500).json({ success: false, message: 'Error deleting recipe pictures' }));
          }

          // Finally, delete from post
          db.query('DELETE FROM post WHERE post_id = ?', [postId], (err) => {
            if (err) {
              console.error('Error deleting from post:', err);
              return db.rollback(() => res.status(500).json({ success: false, message: 'Error deleting post' }));
            }

            // Commit the transaction
            db.commit((err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                return db.rollback(() => res.status(500).json({ success: false, message: 'Transaction commit failed' }));
              }
              return res.json({ success: true, message: 'Post is deleted successfully' });
            });
          });
        });
      });
    });
  });
});

app.post('/post/:id/comment', (req, res) => {
  const { id } = req.params;
  const { text, author } = req.body;
  const date = new Date();

  const query = `INSERT INTO post_comments (post_id, text, author, date) VALUES (?, ?, ?, ?)`;
  db.query(query, [id, text, author, date], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to add comment" });
    }
    res.status(200).json({ id: result.insertId, text, author, date });
  });
});

app.get('/post/:id/comments', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT c.*, u.name 
    FROM post_comments c 
    JOIN user_acc u ON c.author = u.user_id 
    WHERE c.post_id = ? 
    ORDER BY c.date DESC
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch comments' });
    }
    res.status(200).json(results); // Send the comments with user names as JSON response
  });
});

app.delete("/explore-posts/delete/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    await db.query("DELETE FROM posts WHERE post_id = ?", [postId]);

    return res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    return res.status(500).json({ success: false, message: "Failed to delete post" });
  }
});

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

app.get('/explore-posts/:userId', (req, res) => {
  const { userId } = req.params;
  const sqlQuery = `SELECT post_id, user_id, title, cover_image, post_date FROM post WHERE user_id = ? ORDER BY post_date DESC`; // Ensure post_id is included

  db.query(sqlQuery, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching posts:', err);
      res.status(500).send('Error fetching posts');
    } else {
      console.log(result); // Log the result to confirm post_id is being sent
      res.json(result); // Send the result to the frontend
    }
  });
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});