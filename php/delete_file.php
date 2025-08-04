<?php
require 'db.php';

// Get file ID from the request
$fileId = $_GET['id'];

// Prepare the query to fetch the file's path from the database
$query = "SELECT filepath FROM uploaded_files WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->execute([$fileId]);

// Fetch the file information
$file = $stmt->fetch(PDO::FETCH_ASSOC);

if ($file) {
    $filePath = '../uploads/' . $file['filepath'];

    // Check if the file exists before attempting to delete
    if (file_exists($filePath)) {
        // Attempt to delete the file
        if (unlink($filePath)) {
            // If the file is deleted successfully, delete the record from the database
            $deleteQuery = "DELETE FROM uploaded_files WHERE id = ?";
            $deleteStmt = $conn->prepare($deleteQuery);
            $deleteStmt->execute([$fileId]);
            echo json_encode(['status' => 'success', 'message' => 'File deleted successfully.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to delete the file from the server.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'File not found on the server.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'File not found in the database.']);
}
?>
