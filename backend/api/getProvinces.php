<?php
// ===============================================
// 2. getProvinces.php
// ===============================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
   $pdo = new PDO("mysql:localhost;dbname=reseau", "root", "",  [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Vérification du paramètre
    if (!isset($_GET['id_region']) || empty($_GET['id_region'])) {
        echo json_encode([]);
        exit;
    }

    $id_region = (int)$_GET['id_region'];

    if ($id_region <= 0) {
        echo json_encode([]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id_province, nom_province FROM province WHERE id_region = ? ORDER BY nom_province");
    $stmt->execute([$id_region]);
    $provinces = $stmt->fetchAll();

    echo json_encode($provinces);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur base de données: ' . $e->getMessage()]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>