<?php
session_start();
require 'db.php'; // Ensure db.php establishes $conn PDO connection

if (!isset($_SESSION['user_id'])) {
    die("Unauthorized access.");
}

$user_id = $_SESSION['user_id'];

// Fetch the uploaded files for the logged-in user
$stmt = $conn->prepare("SELECT filepath FROM uploaded_files WHERE user_id = ?"); // Only fetch filepath
$stmt->execute([$user_id]);
$files = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Define allowed extensions by category
$allowedExtensions = [
    'image' => ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    'video' => ['mp4', 'avi', 'mov', 'mkv'],
    'excel' => ['xls', 'xlsx', 'xlsm', 'csv'],
    'ppt' => ['ppt', 'pptx'],
    'audio' => ['mp3', 'wav', 'ogg'],
    'code' => ['c', 'cpp', 'py', 'java', 'php', 'js', 'html', 'css'],
    'documents' => ['doc', 'docx', 'txt', 'pdf', 'md', 'log'],
    'other' => [] // Files with unrecognized extensions
];

// Initialize categories with a count or a flag
$folderCategories = [
    'image' => false,
    'video' => false,
    'excel' => false,
    'ppt' => false,
    'audio' => false,
    'code' => false,
    'documents' => false,
    'other' => false
];

// Loop through the files and mark categories that have files
foreach ($files as $file) {
    $filepath = $file['filepath'];
    $ext = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));

    $categoryFound = false;
    foreach ($allowedExtensions as $cat => $exts) {
        if (in_array($ext, $exts)) {
            $folderCategories[$cat] = true; // Mark this category as having files
            $categoryFound = true;
            break;
        }
    }
    // If no specific category found, it falls into 'other'
    if (!$categoryFound) {
        $folderCategories['other'] = true;
    }
}

// Prepare the final array to send to the frontend
$activeFolders = [];
foreach ($folderCategories as $categoryName => $hasFiles) {
    if ($hasFiles) {
        // Capitalize the first letter for display
        $displayCategoryName = ucfirst($categoryName);
        $activeFolders[] = $displayCategoryName;
    }
}

// Return the list of active folder categories as JSON
header('Content-Type: application/json');
echo json_encode($activeFolders, JSON_PRETTY_PRINT);
?>