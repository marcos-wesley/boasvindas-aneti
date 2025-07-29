<?php
header("Content-Type: image/png");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Verificar se é uma requisição POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Método não permitido"]);
    exit;
}

// Verificar se todos os campos foram enviados
$required_fields = ["name", "city", "state", "membership_level"];
foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        http_response_code(400);
        echo json_encode(["error" => "Campo ".$field." é obrigatório"]);
        exit;
    }
}

// Verificar se a foto foi enviada
if (!isset($_FILES["photo"]) || $_FILES["photo"]["error"] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["error" => "Foto é obrigatória"]);
    exit;
}

// Validar tipo de arquivo
$allowed_types = ["image/jpeg", "image/jpg", "image/png"];
$file_type = $_FILES["photo"]["type"];
if (!in_array($file_type, $allowed_types)) {
    http_response_code(400);
    echo json_encode(["error" => "Tipo de arquivo não permitido. Use PNG ou JPG"]);
    exit;
}

// Obter dados do formulário
$name = trim($_POST["name"]);
$city = trim($_POST["city"]);
$state = strtoupper(trim($_POST["state"]));
$membership_level = $_POST["membership_level"];

// Validar nível de associação
$valid_levels = ["publico", "junior", "pleno", "senior"];
if (!in_array($membership_level, $valid_levels)) {
    http_response_code(400);
    echo json_encode(["error" => "Nível de associação inválido"]);
    exit;
}

try {
    // Carregar template baseado no nível de associação
    $template_path = __DIR__ . "/../../templates/{$membership_level}.png";
    if (!file_exists($template_path)) {
        throw new Exception("Template não encontrado: " . $template_path);
    }
    
    $template = imagecreatefrompng($template_path);
    if (!$template) {
        throw new Exception("Erro ao carregar template");
    }
    
    // Obter dimensões do template
    $template_width = imagesx($template);
    $template_height = imagesy($template);
    
    // Carregar foto do usuário
    $user_photo = null;
    switch ($file_type) {
        case "image/jpeg":
        case "image/jpg":
            $user_photo = imagecreatefromjpeg($_FILES["photo"]["tmp_name"]);
            break;
        case "image/png":
            $user_photo = imagecreatefrompng($_FILES["photo"]["tmp_name"]);
            break;
    }
    
    if (!$user_photo) {
        throw new Exception("Erro ao carregar foto do usuário");
    }
    
    // Configurações para o círculo (baseado na análise visual e feedback)
    $circle_x = 540; // Centro X do círculo
    $circle_y = 460; // Centro Y do círculo (ajustado)
    $circle_radius = 172; // Raio do círculo
    
    // Redimensionar e cortar a foto do usuário para o círculo
    $photo_width = imagesx($user_photo);
    $photo_height = imagesy($user_photo);
    
    // Calcular dimensões para manter proporção e preencher o círculo
    $circle_diameter = $circle_radius * 2;
    $scale = max($circle_diameter / $photo_width, $circle_diameter / $photo_height);
    $scaled_width = $photo_width * $scale;
    $scaled_height = $photo_height * $scale;
    
    // Criar imagem redimensionada
    $resized_photo = imagecreatetruecolor($circle_diameter, $circle_diameter);
    imagecopyresampled(
        $resized_photo, $user_photo,
        ($circle_diameter - $scaled_width) / 2, ($circle_diameter - $scaled_height) / 2,
        0, 0,
        $scaled_width, $scaled_height,
        $photo_width, $photo_height
    );
    
    // Criar máscara circular
    $mask = imagecreatetruecolor($circle_diameter, $circle_diameter);
    $transparent = imagecolorallocatealpha($mask, 0, 0, 0, 127);
    imagefill($mask, 0, 0, $transparent);
    $white = imagecolorallocate($mask, 255, 255, 255);
    imagefilledellipse($mask, $circle_diameter/2, $circle_diameter/2, $circle_diameter, $circle_diameter, $white);
    
    // Aplicar máscara circular
    $circular_photo = imagecreatetruecolor($circle_diameter, $circle_diameter);
    imagealphablending($circular_photo, false);
    imagesavealpha($circular_photo, true);
    $transparent = imagecolorallocatealpha($circular_photo, 0, 0, 0, 127);
    imagefill($circular_photo, 0, 0, $transparent);
    
    for ($x = 0; $x < $circle_diameter; $x++) {
        for ($y = 0; $y < $circle_diameter; $y++) {
            $mask_color = imagecolorat($mask, $x, $y);
            if (($mask_color >> 24 & 0x7F) === 0) { // Check if not transparent in mask
                $photo_color = imagecolorat($resized_photo, $x, $y);
                imagesetpixel($circular_photo, $x, $y, $photo_color);
            }
        }
    }
    
    // Copiar foto circular para o template
    imagecopyresampled(
        $template, $circular_photo,
        $circle_x - $circle_radius, $circle_y - $circle_radius,
        0, 0,
        $circle_diameter, $circle_diameter,
        $circle_diameter, $circle_diameter
    );
    
    // Configurar fonte para texto
    $font_size = 40; // Tamanho da fonte ajustado para 40px
    $font_color = imagecolorallocate($template, 1, 45, 106); // Cor da fonte ajustada para #012d6a
    $font_path = __DIR__ . "/../../assets/OpenSans-Bold.ttf";
    
    // Coordenadas exatas para os textos (baseado na análise visual e feedback)
    $name_text_x = 395; // Posição X para o texto Nome
    $name_text_y = 935; // Posição Y para o texto Nome
    $city_state_text_x = 400; // Posição X para o texto Cidade - UF
    $city_state_text_y = 1120; // Posição Y para o texto Cidade - UF

    // Desenhar nome
    imagettftext($template, $font_size, 0, $name_text_x, $name_text_y, $font_color, $font_path, $name);

    // Desenhar cidade - UF
    $city_state = "{$city} - {$state}";
    imagettftext($template, $font_size, 0, $city_state_text_x, $city_state_text_y, $font_color, $font_path, $city_state);
    
    // Gerar nome do arquivo
    $filename = "ANETI-MEMBRO-" . str_replace(" ", "-", strtoupper($name)) . ".png";
    
    // Configurar headers para download
    header("Content-Type: image/png");
    header("Content-Disposition: attachment; filename=". $filename . "");
    
    // Limpar buffer de saída
    ob_clean();
    
    // Enviar imagem
    imagepng($template);
    
    // Limpar memória
    imagedestroy($template);
    imagedestroy($user_photo);
    imagedestroy($resized_photo);
    imagedestroy($mask);
    imagedestroy($circular_photo);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erro interno: " . $e->getMessage()]);
}
?>

