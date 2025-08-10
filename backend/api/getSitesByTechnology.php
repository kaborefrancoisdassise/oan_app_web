<?php
// ===============================================
// 6. getSitesByTechnology.php
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

    $type = isset($_GET['type']) ? $_GET['type'] : '';
    $operateur = isset($_GET['operateur']) ? (int)$_GET['operateur'] : 0;
    $technologie = isset($_GET['technologie']) ? (int)$_GET['technologie'] : 0;

    if (empty($type)) {
        echo json_encode([]);
        exit;
    }

    $query = "
        SELECT 
            s.id_site,
            s.nom_site,
            s.latitude_site,
            s.longitude_site,
            s.annee_site,
            l.nom_localite,
            o.nom_operateur,
            ts.libelle_type,
            t.libelle_trimestre
        FROM site s
        LEFT JOIN localite l ON s.id_localite = l.id_localite
        LEFT JOIN operateur o ON s.id_operateur = o.id_operateur
        LEFT JOIN type_site ts ON s.id_type_site = ts.id_type_site
        LEFT JOIN trimestre t ON s.id_trimestre = t.id_trimestre
        WHERE 1=1
    ";

    $params = [];

    switch ($type) {
        case 'operateur':
            if ($operateur <= 0) {
                echo json_encode([]);
                exit;
            }
            $query .= " AND s.id_operateur = ?";
            $params[] = $operateur;
            break;
        
        case 'technologie':
            if ($technologie <= 0) {
                echo json_encode([]);
                exit;
            }
            $query .= " AND s.id_type_site = ?";
            $params[] = $technologie;
            break;
        
        case 'operateur_tech':
            if ($operateur <= 0 || $technologie <= 0) {
                echo json_encode([]);
                exit;
            }
            $query .= " AND s.id_operateur = ? AND s.id_type_site = ?";
            $params[] = $operateur;
            $params[] = $technologie;
            break;
        
        default:
            echo json_encode([]);
            exit;
    }

    $query .= " ORDER BY s.nom_site";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $sites = $stmt->fetchAll();

    echo json_encode($sites);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur base de données: ' . $e->getMessage()]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>