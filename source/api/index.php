<?php
declare(strict_types=1);
// Public entrypoint only. No credentials, database, or private implementation here.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$documentRoot=realpath($_SERVER['DOCUMENT_ROOT'] ?? '');
$location=getenv('STAR_REBOUND_SERVER_DIR');
if(!$location && $documentRoot)$location=dirname($documentRoot).'/private/hoshigaeshi';
$private=$location ? realpath($location) : false;
$inside=static function(string $path,string $root):bool {
    $path=strtolower(str_replace('\\','/',$path));$root=rtrim(strtolower(str_replace('\\','/',$root)),'/');
    return $path===$root || str_starts_with($path,$root.'/');
};
if(!$documentRoot||!$private||$inside($private,$documentRoot)||!is_file($private.'/bootstrap.php')){
    http_response_code(503);echo json_encode(['error'=>'not_configured','message'=>'ランキングの準備ができていません。ゲームはそのまま遊べます。'],JSON_UNESCAPED_UNICODE);exit;
}
require $private.'/bootstrap.php';
