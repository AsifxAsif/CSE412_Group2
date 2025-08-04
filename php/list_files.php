<?php
session_start();
require 'db.php'; // Ensure db.php establishes $conn PDO connection

header('Content-Type: application/json'); // Ensure the content type is JSON

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get category and subfolder from GET parameters
$category = isset($_GET['category']) ? $_GET['category'] : null;
$subfolder = isset($_GET['subfolder']) ? $_GET['subfolder'] : null;

try {
    $sql = "SELECT id, filename, filepath, upload_date FROM uploaded_files WHERE user_id = ?";
    $params = [$user_id];

    // Add category filter if provided
    if ($category !== null) {
        $sql .= " AND category = ?";
        $params[] = $category;
    }

    // Add subfolder filter if provided
    // Note: This assumes your 'subfolder' column stores the specific subfolder name (e.g., 'xlsm')
    // and not the full path. If it stores the full path, you might need a LIKE query or different logic.
    if ($subfolder !== null) {
        $sql .= " AND subfolder = ?";
        $params[] = $subfolder;
    }

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no files are found, return an empty array
    echo json_encode($files ? $files : []);

} catch (PDOException $e) {
    // Log the error to the server log for debugging
    error_log("Database error in list_files.php: " . $e->getMessage());

    // Respond with a JSON error message
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>