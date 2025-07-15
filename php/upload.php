<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    die("Unauthorized access.");
}

$user_id = $_SESSION['user_id'];
$uploadDir = '../uploads/';

$allowedExtensions = [
    'image' => ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    'video' => ['mp4', 'avi', 'mov', 'mkv'],
    'excel' => ['xls', 'xlsx', 'csv'],
    'ppt' => ['ppt', 'pptx'],
    'audio' => ['mp3', 'wav', 'ogg'],
    'code' => ['c', 'cpp', 'py', 'java', 'php', 'js', 'html', 'css'],
    'documents' => ['doc', 'docx', 'txt', 'pdf', 'md', 'log'],
    'other' => []
];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $files = $_FILES['file'];
    $count = count($files['name']);
    $messages = [];

    for ($i = 0; $i < $count; $i++) {
        $filename = basename($files['name'][$i]);
        $tmpName = $files['tmp_name'][$i];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        // Set default folder to "other" if file extension doesn't match any category
        $folder = 'other/';

        // Check each category and find the folder for the file
        foreach ($allowedExtensions as $category => $extensions) {
            if (in_array($ext, $extensions)) {
                $folder = $category . '/' . $ext . '/';  // Set subfolder for the extension
                break;
            }
        }

        // Set target directory for upload
        $targetDir = $uploadDir . $folder;

        // Check if folder exists, if not create it
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true); // Create directory if not exists
        }

        // Set the target file path
        $targetFile = $targetDir . $filename;

        // Try to move the uploaded file to the correct directory
        if (move_uploaded_file($tmpName, $targetFile)) {
            $relativePath = $folder . $filename;

            // Insert file info into the database
            $stmt = $conn->prepare("INSERT INTO uploaded_files (user_id, filename, filepath) VALUES (?, ?, ?)");
            $stmt->execute([$user_id, $filename, $relativePath]);

            $messages[] = "$filename → $folder";  // Success message for each file
        } else {
            $messages[] = "$filename → Failed";  // Error message for each file
        }
    }

    echo "Upload results:\n" . implode("\n", $messages);  // Display all results
} else {
    echo "No file(s) uploaded.";  // If no files are uploaded
}
?>
