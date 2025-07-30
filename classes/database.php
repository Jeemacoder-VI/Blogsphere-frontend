<?php
class Database {
    private static $host = "localhost";
    private static $db_name = "blogsphere";
    private static $username = "root";
    private static $password = "";
    public static function getConnection() {
        try {
            $conn = new PDO("mysql:host=" . self::$host . ";dbname=" . self::$db_name, self::$username, self::$password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $conn;
        } catch(PDOException $exception) {
            die("Connection error: " . $exception->getMessage());
        }
    }
}
