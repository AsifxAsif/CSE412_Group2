<?php
$host = 'localhost';
$db = 'group2';
$user = 'root';
$pass = '';

header('Content-Type: application/json');

try {
    $conn = new PDO("mysql:host=$host;charset=utf8", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("SHOW DATABASES LIKE :db_name");
    $stmt->execute([':db_name' => $db]);

    if ($stmt->rowCount() == 0) {
        $conn->exec("CREATE DATABASE `$db`");
    }

    $conn->exec("USE `$db`");

    $createUsersTable = "
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ";
    $conn->exec($createUsersTable);

    $createFilesTable = "
    CREATE TABLE IF NOT EXISTS uploaded_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(512) NOT NULL, -- Increased length for longer paths
        category VARCHAR(100) DEFAULT NULL, -- Added category column
        subfolder VARCHAR(100) DEFAULT NULL, -- Added subfolder column
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    ";
    $conn->exec($createFilesTable);

} catch(PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());

    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
}
?>