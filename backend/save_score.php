<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Recibir datos JSON
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (isset($data['name']) && isset($data['score'])) {
    $file = 'scores.json';
    
    // Leer datos actuales
    $current_data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    if (!is_array($current_data)) $current_data = [];

    // Agregar nuevo puntaje
    $current_data[] = [
        'name' => htmlspecialchars($data['name']), // Limpiar nombre por seguridad
        'score' => (int)$data['score']
    ];

    // Guardar
    file_put_contents($file, json_encode($current_data));
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>
