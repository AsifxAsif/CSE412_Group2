<?php
require 'db.php';

$fileId = $_GET['id'];

$query = "SELECT filepath FROM uploaded_files WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->execute([$fileId]);
$file = $stmt->fetch(PDO::FETCH_ASSOC);

if ($file) {
    $filePath = '../uploads/' . $file['filepath'];
    if (file_exists($filePath)) {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
        readfile($filePath);
        exit;
    }
}
?>
