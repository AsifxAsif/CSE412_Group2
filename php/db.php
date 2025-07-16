<?php
$host = 'localhost';
$db = 'group2';
$user = 'root';
$pass = '';

try {
    // Create a PDO instance
    $conn = new PDO("mysql:host=$host;charset=utf8", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if the database exists
    $stmt = $conn->prepare("SHOW DATABASES LIKE :db_name");
    $stmt->execute(['db_name' => $db]);

    // If the database doesn't exist, create it
    if ($stmt->rowCount() == 0) {
        $conn->exec("CREATE DATABASE $db");
        echo "Database created successfully.<br>";
    } else {
        echo "Database already exists.<br>";
    }

    // Select the database to work with
    $conn->exec("USE $db");

    // Create the 'users' table if it doesn't exist
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

    // Create the 'uploaded_files' table if it doesn't exist
    $createFilesTable = "
    CREATE TABLE IF NOT EXISTS uploaded_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(255) NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    ";
    $conn->exec($createFilesTable);

    echo "Tables created (or already exist) successfully.<br>";

} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
