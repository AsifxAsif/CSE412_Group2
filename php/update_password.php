<?php
session_start();
include('db.php'); // Include the database connection

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit();
}

$userId = $_SESSION['user_id'];
$oldPassword = $_POST['old_password'];
$newPassword = $_POST['new_password'];

try {
    // Check if old password is correct
    $stmt = $conn->prepare("SELECT password FROM users WHERE id = :user_id");
    $stmt->execute([':user_id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($oldPassword, $user['password'])) {
        // Update password
        $newPasswordHashed = password_hash($newPassword, PASSWORD_DEFAULT);
        $updateStmt = $conn->prepare("UPDATE users SET password = :newPassword WHERE id = :user_id");
        $updateStmt->execute([':newPassword' => $newPasswordHashed, ':user_id' => $userId]);

        echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Incorrect old password']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error updating password: ' . $e->getMessage()]);
}
?>
