<?php
session_start();
require 'db.php'; // Ensure db.php establishes $conn PDO connection

header('Content-Type: application/json'); // Set content type to JSON

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$uploadDir = '../uploads/'; // Base directory for uploads

$allowedExtensions = [
    'image' => ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    'video' => ['mp4', 'avi', 'mov', 'mkv'],
    'excel' => ['xls', 'xlsx', 'xlsm', 'csv'],
    'ppt' => ['ppt', 'pptx'],
    'audio' => ['mp3', 'wav', 'ogg'],
    'code' => ['c', 'cpp', 'py', 'java', 'php', 'js', 'html', 'css'],
    'documents' => ['doc', 'docx', 'txt', 'pdf', 'md', 'log'],
    'other' => [] // Files not matching specific categories will fall into 'other'
];

$results = []; // Array to store results for each file

// Function to check if a folder is empty
function isFolderEmpty($folderPath) {
    // Scan the folder and return true if it has no files or subdirectories (excluding . and ..)
    $contents = array_diff(scandir($folderPath), array('.', '..'));
    // Log the contents for debugging purposes
    error_log("Checking folder: $folderPath - Contents: " . implode(", ", $contents));
    return count($contents) === 0;
}

// Function to delete a folder and its contents (recursive)
function deleteFolder($folderPath) {
    if (!is_dir($folderPath)) {
        return false; // Ensure it's a folder before attempting to delete
    }

    // Get all files and subdirectories inside the folder
    $files = array_diff(scandir($folderPath), array('.', '..'));

    foreach ($files as $file) {
        $filePath = $folderPath . '/' . $file;
        if (is_dir($filePath)) {
            deleteFolder($filePath); // Recursively delete subfolders
        } else {
            unlink($filePath); // Delete file
        }
    }

    // Now remove the folder itself
    return rmdir($folderPath); // Delete the folder after its contents are deleted
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $files = $_FILES['file'];
    $count = count($files['name']);

    for ($i = 0; $i < $count; $i++) {
        $filename = basename($files['name'][$i]);
        $tmpName = $files['tmp_name'][$i];
        $error = $files['error'][$i];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        // Skip if there's an upload error for this specific file
        if ($error !== UPLOAD_ERR_OK) {
            $results[] = [
                "status" => "error",
                "filename" => $filename,
                "folder" => "N/A",
                "message" => "Upload error: " . $error
            ];
            continue;
        }

        $dbCategory = 'other'; // Default category for database
        $dbSubfolder = ''; // Default subfolder for database (empty for 'other')
        $targetFolderSegment = 'other/'; // Physical folder segment

        // Determine category and subfolder based on extension
        foreach ($allowedExtensions as $categoryKey => $extensions) {
            if (in_array($ext, $extensions)) {
                $dbCategory = $categoryKey; // e.g., 'excel'
                $dbSubfolder = $ext; // e.g., 'xlsm'
                $targetFolderSegment = $categoryKey . '/' . $ext . '/';
                break; // Found a match, no need to check further categories
            }
        }

        // Construct the full target directory path
        $targetDir = $uploadDir . $targetFolderSegment;

        // Create directory if it doesn't exist
        if (!is_dir($targetDir)) {
            if (!mkdir($targetDir, 0777, true)) { // Create recursively
                $results[] = [
                    "status" => "error",
                    "filename" => $filename,
                    "folder" => $targetFolderSegment,
                    "message" => "Failed to create directory."
                ];
                continue; // Skip to next file
            }
        }

        // Set the target file path on the server
        $targetFile = $targetDir . $filename;

        // Prevent uploading the same file twice (check physical existence)
        if (file_exists($targetFile)) {
            $results[] = [
                "status" => "skipped",
                "filename" => $filename,
                "folder" => $targetFolderSegment,
                "message" => "File already exists, skipping upload."
            ];
            continue; // Skip to next file
        }

        // Try to move the uploaded file to the correct directory
        if (move_uploaded_file($tmpName, $targetFile)) {
            // Relative path for database storage (e.g., 'image/jpg/myphoto.jpg')
            $relativePathForDb = $targetFolderSegment . $filename;

            // Insert file info into the database, including category and subfolder
            try {
                $stmt = $conn->prepare("INSERT INTO uploaded_files (user_id, filename, filepath, category, subfolder, upload_date) VALUES (?, ?, ?, ?, ?, NOW())");
                $stmt->execute([$user_id, $filename, $relativePathForDb, $dbCategory, $dbSubfolder]);

                $results[] = [
                    "status" => "success",
                    "filename" => $filename,
                    "folder" => $targetFolderSegment,
                    "message" => "Uploaded successfully."
                ];

                // Check if the subfolder is empty and delete it if necessary
                $subfolderPath = $uploadDir . $dbCategory . '/' . $dbSubfolder;
                if (isFolderEmpty($subfolderPath)) {
                    // Log the deletion attempt for debugging
                    error_log("Deleting subfolder: $subfolderPath");
                    if (deleteFolder($subfolderPath)) {
                        $results[] = [
                            "status" => "success",
                            "message" => "Subfolder '$subfolderPath' deleted because it was empty."
                        ];
                    }
                }

                // Check if the parent folder is empty and delete it if necessary
                $parentFolderPath = $uploadDir . $dbCategory;
                if (isFolderEmpty($parentFolderPath)) {
                    // Log the deletion attempt for debugging
                    error_log("Deleting parent folder: $parentFolderPath");
                    if (deleteFolder($parentFolderPath)) {
                        $results[] = [
                            "status" => "success",
                            "message" => "Parent folder '$parentFolderPath' deleted because it was empty."
                        ];
                    }
                }

            } catch (PDOException $e) {
                error_log("Database error during file upload: " . $e->getMessage());
                // Attempt to delete the physically uploaded file if database insertion failed
                if (file_exists($targetFile)) {
                    unlink($targetFile);
                }
                $results[] = [
                    "status" => "error",
                    "filename" => $filename,
                    "folder" => $targetFolderSegment,
                    "message" => "Database error: " . $e->getMessage()
                ];
            }
        } else {
            $results[] = [
                "status" => "error",
                "filename" => $filename,
                "folder" => $targetFolderSegment,
                "message" => "Failed to move uploaded file."
            ];
        }
    }
    echo json_encode($results); // Return all results as JSON
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "No file(s) uploaded or invalid request."]);
}
?>