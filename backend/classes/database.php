<?php
require_once __DIR__ . '/../config/config.php';

class Database {
    public static function getConnection() {
        return getPDO();
    }
}
