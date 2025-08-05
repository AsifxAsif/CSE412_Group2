<?php
session_start();
include('db.php'); // Include the database connection

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit();
}

$userId = $_SESSION['user_id'];

try {
    // Using PDO to fetch files for the user
    $stmt = $conn->prepare("SELECT * FROM uploaded_files WHERE user_id = :user_id");
    $stmt->execute([':user_id' => $userId]);
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Generate project tree
    $tree = generateTree($files);
    echo json_encode(['success' => true, 'tree' => $tree]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error fetching files: ' . $e->getMessage()]);
}

function generateTree($files) {
    $tree = [];
    foreach ($files as $file) {
        $category = $file['category'];
        $subfolder = $file['subfolder'];

        if (!isset($tree[$category])) {
            $tree[$category] = [];
        }

        if ($subfolder) {
            $found = false;
            foreach ($tree[$category] as &$folder) {
                if ($folder['name'] === $subfolder) {
                    $folder['subfolders'][] = ['name' => $file['filename']];
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $tree[$category][] = [
                    'name' => $subfolder,
                    'subfolders' => [['name' => $file['filename']]]
                ];
            }
        } else {
            $tree[$category][] = ['name' => $file['filename']];
        }
    }

    return $tree;
}
?>
