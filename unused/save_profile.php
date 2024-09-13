<?php
// Database configuration
$servername = "localhost"; // or your server
$username = "recipeblog"; // your database username
$password = ""; // your database password
$dbname = "user_acc"; // your database name

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Get the profile data from the POST request
$user_id = isset($_POST['user_id']) ? $_POST['user_id'] : null;
$name = $_POST['name'];
$email = $_POST['email'];
$password = $_POST['password'];

// Handle profile picture upload (if any)
if (isset($_FILES['profilePicture']['tmp_name'])) {
    $profilePicture = file_get_contents($_FILES['profilePicture']['tmp_name']);
} else {
    $profilePicture = null;
}

// Hash the password for security
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Check if the user exists (for updating or inserting)
if ($user_id) {
    // Update existing user
    $sql = "UPDATE users SET name = ?, email = ?, password = ?, profile_picture = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssi", $name, $email, $hashedPassword, $profilePicture, $user_id);
} else {
    // Insert new user
    $sql = "INSERT INTO users (name, email, password, profile_picture) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $name, $email, $hashedPassword, $profilePicture);
}

if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "Profile saved successfully"]);
} else {
  echo json_encode(["success" => false, "message" => "Error saving profile: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
