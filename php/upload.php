<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    die("Unauthorized access.");
}

$user_id = $_SESSION['user_id'];
$uploadDir = '../uploads/';

$allowedImage = ['jpg', 'jpeg', 'png', 'gif'];
$allowedText = ['txt', 'md', 'log'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $files = $_FILES['file'];
    $count = count($files['name']);
    $messages = [];

    for ($i = 0; $i < $count; $i++) {
        $filename = basename($files['name'][$i]);
        $tmpName = $files['tmp_name'][$i];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (in_array($ext, $allowedImage)) {
            $folder = 'img/';
        } elseif (in_array($ext, $allowedText)) {
            $folder = 'txt/';
        } else {
            $folder = 'other/';
        }

        $targetDir = $uploadDir . $folder;
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $targetFile = $targetDir . $filename;

        if (move_uploaded_file($tmpName, $targetFile)) {
            $relativePath = $folder . $filename;
            $stmt = $conn->prepare("INSERT INTO uploaded_files (user_id, filename, filepath) VALUES (?, ?, ?)");
            $stmt->execute([$user_id, $filename, $relativePath]);

            $messages[] = "$filename → $folder";
        } else {
            $messages[] = "$filename → Failed";
        }
    }

    echo "Upload results:\n" . implode("\n", $messages);
} else {
    echo "No file(s) uploaded.";
}
?>
