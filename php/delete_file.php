<?php
require 'db.php';

$fileId = $_GET['id'];

$query = "SELECT filepath FROM uploaded_files WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->execute([$fileId]);
$file = $stmt->fetch(PDO::FETCH_ASSOC);

if ($file) {
    $filePath = '../uploads/' . $file['filepath'];
    if (unlink($filePath)) {
        $deleteQuery = "DELETE FROM uploaded_files WHERE id = ?";
        $deleteStmt = $conn->prepare($deleteQuery);
        $deleteStmt->execute([$fileId]);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
} else {
    echo json_encode(['success' => false]);
}
?>
