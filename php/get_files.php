<?php
require 'db.php';

$fileId = $_GET['id'];

$query = "SELECT filename, filepath FROM uploaded_files WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->execute([$fileId]);
$file = $stmt->fetch(PDO::FETCH_ASSOC);

if ($file) {
    // Adjust the file path for web access
    $fileUrl = 'http://localhost/lab/uploads/' . $file['filepath']; // Correct the file path
    echo json_encode(['success' => true, 'filename' => $file['filename'], 'filepath' => $fileUrl]);
} else {
    echo json_encode(['success' => false, 'error' => 'File not found']);
}
?>
