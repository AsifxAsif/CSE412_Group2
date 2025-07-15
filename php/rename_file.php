<?php
require 'db.php';

$fileId = $_GET['id'];
$newFileName = $_GET['newName'];

// Query to get the old file path
$query = "SELECT filepath FROM uploaded_files WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->execute([$fileId]);
$file = $stmt->fetch(PDO::FETCH_ASSOC);

if ($file) {
    $oldFilePath = $file['filepath'];
    $oldFilePathParts = pathinfo($oldFilePath);
    $newFileExtension = strtolower(pathinfo($newFileName, PATHINFO_EXTENSION));

    // Define allowed file extensions and their respective folders
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

    // Default folder is 'other'
    $newFolder = 'other/';

    // Check the new file extension to determine the correct folder
    foreach ($allowedExtensions as $category => $extensions) {
        if (in_array($newFileExtension, $extensions)) {
            $newFolder = $category . '/' . $newFileExtension . '/';
            break;
        }
    }

    // Generate new file path
    $newFilePath = $newFolder . $newFileName;
    $newFilePathParts = pathinfo($newFilePath);
    $newFolderPath = '../uploads/' . $newFilePathParts['dirname'];

    // Create the new folder if it doesn't exist
    if (!is_dir($newFolderPath)) {
        mkdir($newFolderPath, 0777, true);  // Create directory with full permissions
    }

    // Try renaming and moving the file
    if (rename('../uploads/' . $oldFilePath, '../uploads/' . $newFilePath)) {
        // Update the database with the new filename and filepath
        $updateQuery = "UPDATE uploaded_files SET filename = ?, filepath = ? WHERE id = ?";
        $stmt = $conn->prepare($updateQuery);
        $success = $stmt->execute([$newFileName, $newFilePath, $fileId]);

        echo json_encode(['success' => $success]);  // Return success response
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to rename and move the file']);  // Error response
    }
} else {
    echo json_encode(['success' => false, 'error' => 'File not found']);  // File not found error
}
?>