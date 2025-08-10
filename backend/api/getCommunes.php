<?php
// ===============================================
// 3. getCommunes.php
// ===============================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $pdo = new PDO("mysql:localhost;dbname=reseau", "root", "", [
         PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Vérification du paramètre
    if (!isset($_GET['id_province']) || empty($_GET['id_province'])) {
        echo json_encode([]);
        exit;
    }

    $id_province = (int)$_GET['id_province'];

    if ($id_province <= 0) {
        echo json_encode([]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id_commune, nom_commune FROM commune WHERE id_province = ? ORDER BY nom_commune");
    $stmt->execute([$id_province]);
    $communes = $stmt->fetchAll();

    echo json_encode($communes);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur base de données: ' . $e->getMessage()]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>