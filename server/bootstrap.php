<?php
declare(strict_types=1);
require_once __DIR__.'/Leaderboard.php';
use StarRebound\ApiError;
use StarRebound\Leaderboard;

function reply(int $status,array $payload):never {
    http_response_code($status);
    if(in_array($status,[429,503],true))header('Retry-After: 3');
    echo json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);exit;
}
try {
    $origin=rtrim((string)getenv('STAR_REBOUND_ALLOWED_ORIGIN'),'/');
    $parts=parse_url($origin);
    if(!$parts||!isset($parts['scheme'],$parts['host'])||!in_array($parts['scheme'],['http','https'],true)||isset($parts['path'])||isset($parts['user'])||isset($parts['query'])||isset($parts['fragment']))throw new ApiError(503,'not_configured','ランキングの接続設定を確認中です。');
    if($parts['scheme']==='http'&&!in_array($parts['host'],['127.0.0.1','localhost','[::1]'],true))throw new ApiError(503,'https_required','ランキングの接続設定を確認中です。');
    $action=$_GET['action']??'top';$method=$_SERVER['REQUEST_METHOD']??'GET';
    if(!is_string($action)||!in_array($action,['top','start','finish'],true))throw new ApiError(404,'not_found','その操作は見つかりません。');
    if(($action==='top'&&$method!=='GET')||($action!=='top'&&$method!=='POST')){header('Allow: '.($action==='top'?'GET':'POST'));throw new ApiError(405,'method','この操作方法は使えません。');}
    $requestOrigin=$_SERVER['HTTP_ORIGIN']??null;
    if(($method==='POST'&&$requestOrigin!==$origin)||($requestOrigin!==null&&$requestOrigin!==$origin)||($method==='POST'&&($_SERVER['HTTP_SEC_FETCH_SITE']??'same-origin')==='cross-site'))throw new ApiError(403,'origin','ゲームと同じページからお試しください。');
    $body=[];
    if($method==='POST'){
        if(strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]))!=='application/json')throw new ApiError(415,'json_required','JSON形式のリクエストが必要です。');
        if((int)($_SERVER['CONTENT_LENGTH']??0)>8192)throw new ApiError(413,'too_large','送信内容が大きすぎます。');
        $raw=file_get_contents('php://input',false,null,0,8193);
        if($raw===false||strlen($raw)>8192)throw new ApiError(413,'too_large','送信内容が大きすぎます。');
        try{$body=json_decode($raw,true,32,JSON_THROW_ON_ERROR);}catch(JsonException){throw new ApiError(400,'json_invalid','送信内容を読み取れませんでした。');}
        if(!is_array($body)||array_is_list($body))throw new ApiError(400,'json_invalid','送信内容を読み取れませんでした。');
    }
    $data=getenv('STAR_REBOUND_DATA_DIR');
    if(!$data)throw new ApiError(503,'not_configured','ランキングの保存先を確認中です。');
    if(!is_dir($data)&&!mkdir($data,0700,true)&&!is_dir($data))throw new ApiError(503,'storage','ランキングを一時的に利用できません。');
    $resolved=realpath($data);$root=realpath($_SERVER['DOCUMENT_ROOT']??'');
    $normalize=static fn(string $s):string=>rtrim(strtolower(str_replace('\\','/',$s)),'/');
    if(!$resolved||!$root||$normalize($resolved)===$normalize($root)||str_starts_with($normalize($resolved),$normalize($root).'/'))throw new ApiError(503,'storage_location','ランキングの保存先を確認中です。');
    $keyPath=$resolved.'/server.key';
    if(!is_file($keyPath)){
        $handle=@fopen($keyPath,'x');
        if($handle){$key=random_bytes(32);if(fwrite($handle,$key)!==32){fclose($handle);throw new ApiError(503,'storage','ランキングを一時的に利用できません。');}fclose($handle);@chmod($keyPath,0600);}
    }
    $key=@file_get_contents($keyPath);
    if($key===false||strlen($key)!==32)throw new ApiError(503,'storage','ランキングを一時的に利用できません。');
    $cookie=$_COOKIE['hoshigaeshi_browser_v1']??'';$token='';
    if(is_string($cookie)&&preg_match('/^([a-f0-9]{64})\.([a-f0-9]{64})$/D',$cookie,$match)&&hash_equals(hash_hmac('sha256',$match[1],$key),$match[2]))$token=$match[1];
    if($token===''){
        $token=bin2hex(random_bytes(32));$signed=$token.'.'.hash_hmac('sha256',$token,$key);
        setcookie('hoshigaeshi_browser_v1',$signed,['expires'=>time()+31536000,'path'=>'/','secure'=>$parts['scheme']==='https','httponly'=>true,'samesite'=>'Lax']);
    }
    $actor=hash_hmac('sha256','browser:'.$token,$key);
    $dbPath=$resolved.'/leaderboard.sqlite';
    $db=new PDO('sqlite:'.$dbPath);@chmod($dbPath,0600);
    $store=new Leaderboard($db);
    if($action==='top'){
        $difficulty=$_GET['difficulty']??'normal';if(!is_string($difficulty))throw new ApiError(422,'difficulty','難しさを選び直してください。');
        reply(200,$store->top($difficulty));
    }
    if($action==='start'){
        if(count($body)!==2||!isset($body['difficulty'],$body['ruleset'])||!is_string($body['difficulty'])||$body['ruleset']!==Leaderboard::RULESET)throw new ApiError(409,'rules_changed','新しいページを読み込み直してお試しください。');
        // Only a daily keyed, short-lived rate bucket is stored; never the raw address.
        $network=hash_hmac('sha256',gmdate('Y-m-d').':'.($_SERVER['REMOTE_ADDR']??'unknown'),$key);
        reply(201,$store->start($actor,$body['difficulty'],$network));
    }
    reply(200,$store->finish($actor,$body));
}catch(ApiError $e){reply($e->status,['error'=>$e->errorCode,'message'=>$e->getMessage()]);}
catch(PDOException){reply(503,['error'=>'storage_busy','message'=>'ランキングが混み合っています。少し待って再送してください。']);}
catch(Throwable){reply(503,['error'=>'unavailable','message'=>'ランキングを一時的に利用できません。ゲームはそのまま遊べます。']);}
