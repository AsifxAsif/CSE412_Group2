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
$category = isset($_GET['category']) ? $_GET['category'] : null;

try {
    // Select distinct subfolders for the given user and category
    $sql = "SELECT DISTINCT subfolder FROM uploaded_files WHERE user_id = ?";
    $params = [$user_id];

    if ($category !== null) {
        $sql .= " AND category = ?";
        $params[] = $category;
    }

    // Exclude NULL or empty subfolders if they exist in your data
    $sql .= " AND subfolder IS NOT NULL AND subfolder != ''";

    $sql .= " ORDER BY subfolder ASC"; // Order alphabetically for consistent display

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $subfolders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the output to just contain folder names
    $folderNames = [];
    foreach ($subfolders as $row) {
        $folderNames[] = ['name' => $row['subfolder']]; // Wrap in an object with 'name' key
    }

    echo json_encode($folderNames);

} catch (PDOException $e) {
    error_log("Database error in list_folders.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>