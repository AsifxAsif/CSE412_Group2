<?php
header('Content-Type: application/json');

$baseUploadDir = '../uploads/'; // Adjust this path as needed

if (isset($_GET['category'])) {
    $category = basename($_GET['category']); // Sanitize input
    $categoryPath = $baseUploadDir . $category;

    if (is_dir($categoryPath)) {
        $subfolders = [];
        $items = scandir($categoryPath);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            if (is_dir($categoryPath . '/' . $item)) {
                $subfolders[] = $item; // Add only directories (subfolders)
            }
        }
        echo json_encode($subfolders);
    } else {
        echo json_encode([]); // Category not found or not a directory
    }
} else {
    echo json_encode([]); // No category provided
}
?>