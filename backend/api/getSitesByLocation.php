<?php
// ===============================================
// 5. getSitesByLocation.php
// ===============================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
   $pdo = new PDO("mysql:host=localhost;dbname=reseau;charset=utf8", "root", "",  [
       PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $type = isset($_GET['type']) ? $_GET['type'] : '';
    $value = isset($_GET['value']) ? (int)$_GET['value'] : 0;

    if (empty($type) || $value <= 0) {
        echo json_encode([]);
        exit;
    }

    // Requête de base pour récupérer tous les sites
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
    ";

    $params = [$value];

    // Adapter selon le type de filtre
    switch ($type) {
        case 'region':
            // Pour l'instant, on va simuler avec tous les sites
            // Vous devrez ajuster selon votre vraie structure
            $query .= " WHERE 1=1 ORDER BY s.nom_site LIMIT 50";
            $params = [];
            break;
        
        case 'province':
            $query .= " WHERE 1=1 ORDER BY s.nom_site LIMIT 50";
            $params = [];
            break;
        
        case 'commune':
            $query .= " WHERE 1=1 ORDER BY s.nom_site LIMIT 50";
            $params = [];
            break;
        
        case 'village':
            // Si les sites sont liés directement aux villages
            $query = "
                SELECT 
                    s.id_site,
                    s.nom_site,
                    s.latitude_site,
                    s.longitude_site,
                    s.annee_site,
                    v.nom_village as nom_localite,
                    o.nom_operateur,
                    ts.libelle_type,
                    t.libelle_trimestre
                FROM site s
                LEFT JOIN village v ON s.id_localite = v.id_village
                LEFT JOIN operateur o ON s.id_operateur = o.id_operateur
                LEFT JOIN type_site ts ON s.id_type_site = ts.id_type_site
                LEFT JOIN trimestre t ON s.id_trimestre = t.id_trimestre
                WHERE v.id_village = ?
                ORDER BY s.nom_site
            ";
            break;
        
        default:
            echo json_encode([]);
            exit;
    }

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