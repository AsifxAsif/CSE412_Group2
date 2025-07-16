<?php
session_start();
require 'db.php';

header('Content-Type: application/json');  // Ensure the content type is JSON

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $stmt = $conn->prepare("SELECT id, filepath, upload_date FROM uploaded_files WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no files are found, return an empty array
    echo json_encode($files ? $files : []);
} catch (PDOException $e) {
    // Log the error to the server log for debugging
    error_log("Database error: " . $e->getMessage());

    // Respond with a JSON error message
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
