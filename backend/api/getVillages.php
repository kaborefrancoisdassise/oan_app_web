<?php
// ===============================================
// 4. getVillages.php
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
    if (!isset($_GET['id_commune']) || empty($_GET['id_commune'])) {
        echo json_encode([]);
        exit;
    }

    $id_commune = (int)$_GET['id_commune'];

    if ($id_commune <= 0) {
        echo json_encode([]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id_village, nom_village FROM village WHERE id_commune = ? ORDER BY nom_village");
    $stmt->execute([$id_commune]);
    $villages = $stmt->fetchAll();

    echo json_encode($villages);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur base de données: ' . $e->getMessage()]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>