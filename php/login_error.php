<?php
session_start();

$response = [];

if (isset($_SESSION['login_error'])) {
    $response['error'] = $_SESSION['login_error'];
    unset($_SESSION['login_error']);
}

header('Content-Type: application/json');
echo json_encode($response);
?>
