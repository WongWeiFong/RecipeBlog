<?php
// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "user_acc";

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Retrieve user_id from request
$user_id = $_GET['user_id'] ?? 1;

// Prepare SQL query to fetch the user's profile
$sql = "SELECT name, email, password, profile_picture FROM users WHERE user_id = $user_id";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

// Check if a user is found
if ($result->num_rows > 0) {
  // Fetch the data
  $row = $result->fetch_assoc();
  // Send user data as JSON response
  echo json_encode([
    "success" => true,
    "name" => $row['name'],
    "email" => $row['email'],
    "password" => $row['password'], // Make sure not to expose raw passwords in production
    "profile_picture" => base64_encode($row['profile_picture']) // Convert binary data to base64
  ]);
} else {
  echo json_encode(["success" => false, "message" => "User not found"]);
}

$stmt->close();
$conn->close();
?>
