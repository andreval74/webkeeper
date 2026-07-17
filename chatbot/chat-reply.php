<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'reply' => '']);
    exit;
}

$configFile = __DIR__ . '/groq-config.php';
if (!file_exists($configFile)) {
    echo json_encode(['ok' => false, 'reply' => '']);
    exit;
}
require $configFile;

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'reply' => '']);
    exit;
}

$messages = isset($data['messages']) && is_array($data['messages']) ? $data['messages'] : [];
$name = isset($data['name']) ? (string) $data['name'] : '';

function wk_load_kb() {
    $path = __DIR__ . '/knowledge-base.json';
    $json = @file_get_contents($path);
    $kb = json_decode($json, true);
    return is_array($kb) ? $kb : [];
}

function wk_build_system_prompt($kb, $name) {
    $servicos = [];
    foreach (($kb['faq'] ?? []) as $item) {
        if (!empty($item['resposta'])) {
            $servicos[] = '- ' . $item['resposta'];
        }
    }
    $servicosTxt = implode("\n", $servicos);
    $nomeTxt = $name !== '' ? "O nome do visitante é {$name}." : '';

    return "Você é o assistente virtual da WebKeeper, uma fábrica de ideias/agência de tecnologia (sistemas sob medida, automação com IA, chatbots, Web3/smart contracts, marketing digital e SEO), conduzida pelo André Val. {$nomeTxt}\n\n"
        . "Informações da empresa e dos serviços (use como base de conhecimento, não despeje tudo de uma vez):\n{$servicosTxt}\n\n"
        . "Regras de conversa:\n"
        . "- Responda em português do Brasil, de forma curta, natural e direta, como uma pessoa conversando — não como uma lista de FAQ.\n"
        . "- Preste muita atenção na ÚLTIMA mensagem do visitante e na sua própria pergunta anterior: responda exatamente ao que foi dito (inclusive um simples 'sim'/'não'), e nunca repita uma explicação que você já deu nesta mesma conversa.\n"
        . "- Faça perguntas de descoberta quando fizer sentido: se o visitante já tem site, qual a maior dor/problema hoje, o que espera resolver ou alcançar.\n"
        . "- Quando identificar a necessidade, ofereça proativamente o serviço da WebKeeper mais adequado.\n"
        . "- Nunca invente preço fechado — direcione sempre para um orçamento personalizado com o André.\n"
        . "- Não se reapresente a cada mensagem, isso já foi feito no início da conversa.";
}

$kb = wk_load_kb();
$systemPrompt = wk_build_system_prompt($kb, $name);

$chatMessages = [['role' => 'system', 'content' => $systemPrompt]];
foreach ($messages as $m) {
    if (!is_array($m) || !isset($m['who'], $m['text'])) {
        continue;
    }
    $role = $m['who'] === 'user' ? 'user' : 'assistant';
    $chatMessages[] = ['role' => $role, 'content' => (string) $m['text']];
}

if (count($chatMessages) <= 1) {
    echo json_encode(['ok' => false, 'reply' => '']);
    exit;
}

$payload = json_encode([
    'model' => 'llama-3.3-70b-versatile',
    'messages' => $chatMessages,
    'temperature' => 0.6,
    'max_tokens' => 300
]);

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . GROQ_API_KEY
    ],
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_TIMEOUT => 8
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($response === false || $httpCode >= 300) {
    error_log('chat-reply.php: falha na chamada Groq - ' . $curlErr . ' http=' . $httpCode . ' body=' . $response);
    echo json_encode(['ok' => false, 'reply' => '']);
    exit;
}

$result = json_decode($response, true);
$reply = trim($result['choices'][0]['message']['content'] ?? '');

if ($reply === '') {
    echo json_encode(['ok' => false, 'reply' => '']);
    exit;
}

echo json_encode(['ok' => true, 'reply' => $reply]);
