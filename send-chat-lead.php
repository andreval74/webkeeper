<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

function wk_clean_line($value) {
    $value = (string) $value;
    $value = str_replace(["\r", "\n"], ' ', $value);
    return trim($value);
}

$contactRaw = isset($data['contact_raw']) ? wk_clean_line($data['contact_raw']) : '';
$page = isset($data['page']) ? wk_clean_line($data['page']) : '';
$sentAt = isset($data['sentAt']) ? wk_clean_line($data['sentAt']) : date('c');
$conversation = isset($data['conversation']) && is_array($data['conversation']) ? $data['conversation'] : [];

$transcriptLines = [];
foreach ($conversation as $msg) {
    if (!is_array($msg) || !isset($msg['who'], $msg['text'])) {
        continue;
    }
    $who = $msg['who'] === 'user' ? 'Visitante' : 'Bot';
    $transcriptLines[] = $who . ': ' . wk_clean_line($msg['text']);
}
$transcript = implode("\n", $transcriptLines);

$to = 'contato@webkeeper.com.br';
$subject = 'Novo lead via chatbot do site';

$body = "Um novo contato veio pelo chatbot do site.\n\n";
$body .= "Contato informado: " . $contactRaw . "\n";
$body .= "Página: " . $page . "\n";
$body .= "Data/hora: " . $sentAt . "\n\n";
$body .= "Transcrição da conversa:\n" . $transcript . "\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: WebKeeper Site <no-reply@webkeeper.com.br>';

$sent = @mail($to, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    error_log('send-chat-lead.php: falha ao enviar e-mail de lead do chatbot');
}

echo json_encode(['ok' => true]);
