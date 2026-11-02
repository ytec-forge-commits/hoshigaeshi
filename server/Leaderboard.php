<?php
declare(strict_types=1);
namespace StarRebound;

use PDO;
use RuntimeException;
use Throwable;

final class ApiError extends RuntimeException {
    public function __construct(public readonly int $status, public readonly string $errorCode, string $message) { parent::__construct($message); }
}

/** Private server code. The database and server key must stay outside DocumentRoot. */
final class Leaderboard {
    public const RULESET = 'feedback4-20261031';
    private const HP = ['easy'=>5,'normal'=>4,'hard'=>3,'nightmare'=>2];
    private $clock;
    public function __construct(private PDO $db, ?callable $clock = null) {
        $this->clock = $clock ?? fn():float => microtime(true);
        $db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
        $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE,PDO::FETCH_ASSOC);
        $db->exec('PRAGMA busy_timeout=4000');
        $version=(int)$db->query('PRAGMA user_version')->fetchColumn();
        if($version!==0 && $version!==1) throw new ApiError(503,'storage_version','ランキングを一時的に利用できません。');
        $db->exec('CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY,browser TEXT NOT NULL,nonce_hash TEXT NOT NULL,difficulty TEXT NOT NULL,ruleset TEXT NOT NULL,seed INTEGER NOT NULL,started REAL NOT NULL,expires REAL NOT NULL,payload_hash TEXT,response TEXT,completed REAL)');
        $db->exec('CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY AUTOINCREMENT,browser TEXT NOT NULL,difficulty TEXT NOT NULL,ruleset TEXT NOT NULL,name TEXT NOT NULL,score INTEGER NOT NULL,stage INTEGER NOT NULL,cleared INTEGER NOT NULL,recorded REAL NOT NULL,UNIQUE(browser,difficulty,ruleset))');
        $db->exec('CREATE INDEX IF NOT EXISTS score_order ON scores(ruleset,difficulty,score DESC,stage DESC,recorded,id)');
        $db->exec('CREATE INDEX IF NOT EXISTS run_expiry ON runs(expires)');
        $db->exec('CREATE TABLE IF NOT EXISTS rates (bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,expires REAL NOT NULL)');
        $db->exec('CREATE TABLE IF NOT EXISTS score_details (score_id INTEGER PRIMARY KEY,version INTEGER NOT NULL,score INTEGER NOT NULL,stage INTEGER NOT NULL,recorded REAL NOT NULL,details TEXT NOT NULL)');
        if($version===0)$db->exec('PRAGMA user_version=1');
    }
    private function now():float { return ($this->clock)(); }
    private static function difficulty(string $value):void {
        if(!array_key_exists($value,self::HP))throw new ApiError(422,'difficulty','難しさを選び直してください。');
    }
    private function query(string $sql,array $args=[]):\PDOStatement { $q=$this->db->prepare($sql);$q->execute($args);return $q; }
    private function atomic(callable $fn):mixed {
        $this->db->exec('BEGIN IMMEDIATE');
        try{$result=$fn();$this->db->exec('COMMIT');return $result;}
        catch(Throwable $e){try{$this->db->exec('ROLLBACK');}catch(Throwable){}throw $e;}
    }
    private function limit(string $key,int $maximum,int $seconds,float $now):void {
        $bucket=$key.':'.(int)floor($now/$seconds);
        // All callers hold BEGIN IMMEDIATE; existing bucket expiry stays unchanged.
        $this->query('INSERT OR IGNORE INTO rates(bucket,count,expires) VALUES(?,0,?)',[$bucket,$now+$seconds*2]);
        $this->query('UPDATE rates SET count=count+1 WHERE bucket=?',[$bucket]);
        if((int)$this->query('SELECT count FROM rates WHERE bucket=?',[$bucket])->fetchColumn()>$maximum)throw new ApiError(429,'rate_limited','しばらく待ってから、もう一度お試しください。');
    }
    public function start(string $actor,string $difficulty,?string $networkBucket=null):array {
        self::difficulty($difficulty);$now=$this->now();
        return $this->atomic(function()use($actor,$difficulty,$networkBucket,$now){
            $this->limit('start:'.$actor,30,3600,$now);
            if($networkBucket!==null)$this->limit('network:'.$networkBucket,80,3600,$now);
            $this->query('DELETE FROM rates WHERE expires<?',[$now]);
            $this->query('DELETE FROM runs WHERE (completed IS NULL AND expires<?) OR completed<?',[$now-86400,$now-604800]);
            $id=bin2hex(random_bytes(16));$nonce=bin2hex(random_bytes(32));$seed=random_int(1,2147483647);$expires=$now+7200;
            $this->query('INSERT INTO runs(id,browser,nonce_hash,difficulty,ruleset,seed,started,expires) VALUES(?,?,?,?,?,?,?,?)',[$id,$actor,hash('sha256',$nonce),$difficulty,self::RULESET,$seed,$now,$expires]);
            return ['runId'=>$id,'nonce'=>$nonce,'difficulty'=>$difficulty,'ruleset'=>self::RULESET,'seed'=>$seed,'expiresAt'=>(int)$expires,'detailsVersion'=>1];
        });
    }
    public static function normalizeName(string $value):string {
        if(!mb_check_encoding($value,'UTF-8')||preg_match('/[\p{C}<>]/u',$value))throw new ApiError(422,'name','名前は改行や記号 < > を含めず、1〜12文字で入力してください。');
        $value=trim((string)preg_replace('/\p{Z}+/u',' ',$value));$length=mb_strlen($value,'UTF-8');
        if($length<1||$length>12)throw new ApiError(422,'name','名前は1〜12文字で入力してください。');
        return $value;
    }
    private static function integer(array $p,string $key,int $min,int $max):int {
        if(!isset($p[$key])||!is_int($p[$key])||$p[$key]<$min||$p[$key]>$max)throw new ApiError(422,'invalid_result','結果の形式を確認できませんでした。');
        return $p[$key];
    }
    private static function payload(array $p):array {
        $keys=['runId','nonce','difficulty','ruleset','seed','name','score','time','result','stageIndex','completedStages','hp','kills','returned','bestCombo','hits','captureUses'];
        if(count($p)!==count($keys)+(array_key_exists('details',$p)?1:0)||array_diff(array_keys($p),array_merge($keys,['details'])))throw new ApiError(422,'invalid_result','結果の形式を確認できませんでした。');
        foreach(['runId','nonce','difficulty','ruleset','name','result'] as $k)if(!isset($p[$k])||!is_string($p[$k]))throw new ApiError(422,'invalid_result','結果の形式を確認できませんでした。');
        if(!preg_match('/^[a-f0-9]{32}$/D',$p['runId'])||!preg_match('/^[a-f0-9]{64}$/D',$p['nonce']))throw new ApiError(403,'run_invalid','このプレイの登録情報を確認できませんでした。');
        self::difficulty($p['difficulty']);$p['name']=self::normalizeName($p['name']);
        foreach(['seed'=>[1,2147483647],'score'=>[0,9999999],'stageIndex'=>[0,2],'completedStages'=>[0,3],'hp'=>[0,5],'kills'=>[0,2000],'returned'=>[0,30000],'bestCombo'=>[0,2000],'hits'=>[0,1000],'captureUses'=>[0,900]] as $k=>$range)self::integer($p,$k,$range[0],$range[1]);
        if(!isset($p['time'])||(!is_int($p['time'])&&!is_float($p['time']))||!is_finite((float)$p['time'])||$p['time']<0||$p['time']>900||abs($p['time']*10-round($p['time']*10))>.0001)throw new ApiError(422,'invalid_result','プレイ時間を確認できませんでした。');
        if(!in_array($p['result'],['lost','timeout','stage-clear'],true))throw new ApiError(422,'invalid_result','この結果はランキングに登録できません。');
        $hp=self::HP[$p['difficulty']];$clear=$p['result']==='stage-clear';$minimum=[0,89.5,181.0,270.5][$p['completedStages']];
        $valid=$p['hp']<=$hp && ($clear?($p['stageIndex']===2&&$p['completedStages']===3&&$p['hp']>0):$p['completedStages']===$p['stageIndex']);
        $valid=$valid&&($p['result']==='lost'?($p['hp']===0&&$p['hits']>=$hp):$p['hp']>0);
        $valid=$valid&&$p['time']+.1>=$minimum&&$p['time']+.1>=max(0,$p['hits']-1)*($p['difficulty']==='easy'?3:1.8);
        $valid=$valid&&$p['kills']<=floor($p['time']*15)+10&&$p['bestCombo']<=$p['kills']&&$p['captureUses']<=floor($p['time'])+1;
        $valid=$valid&&$p['returned']<=$p['captureUses']*360&&$p['returned']<=floor($p['time']*90)+360;
        $valid=$valid&&$p['score']%4===0&&$p['score']>=$p['returned']*12+$p['kills']*120&&$p['score']<=$p['returned']*12+$p['kills']*15000+$p['completedStages']*$hp*500;
        if(!$valid)throw new ApiError(422,'invalid_result','結果の整合性を確認できませんでした。');
        // Canonical order makes a retried normalized payload stable.
        $out=[];foreach($keys as $key)$out[$key]=$p[$key];$out['time']=(float)$out['time'];
        if(array_key_exists('details',$p))$out['details']=self::validateDetails($p);
        return $out;
    }
    private static function validateDetails(array $p):array {
        $d=$p['details'];
        if(!is_array($d)||count($d)!==3||array_diff(array_keys($d),['version','heals','scoreBreakdown'])||($d['version']??null)!==1)throw new ApiError(422,'invalid_result','記録詳細の形式を確認できませんでした。');
        $heals=self::integer($d,'heals',0,$p['captureUses']+$p['completedStages']);$b=$d['scoreBreakdown'];
        if(!is_array($b)||count($b)!==3||array_diff(array_keys($b),['defeats','returns','lifeBonus']))throw new ApiError(422,'invalid_result','得点内訳を確認できませんでした。');
        $defeats=self::integer($b,'defeats',0,9999999);$returns=self::integer($b,'returns',0,360000);$bonus=self::integer($b,'lifeBonus',0,$p['completedStages']*self::HP[$p['difficulty']]*500);
        if($defeats+$returns+$bonus!==$p['score']||$returns!==$p['returned']*12||$bonus%500!==0||$defeats%20!==0||$defeats<$p['kills']*120||$defeats>$p['kills']*15000)throw new ApiError(422,'invalid_result','得点内訳の整合性を確認できませんでした。');
        return ['version'=>1,'heals'=>$heals,'scoreBreakdown'=>['defeats'=>$defeats,'returns'=>$returns,'lifeBonus'=>$bonus]];
    }
    private static function recordDetails(array $p):array {
        $out=['version'=>1];foreach(['time','hp','kills','returned','bestCombo','hits','captureUses'] as $key)$out[$key]=$p[$key];
        $out['heals']=$p['details']['heals']??null;$out['scoreBreakdown']=$p['details']['scoreBreakdown']??null;return $out;
    }
    public function finish(string $actor,array $input):array {
        $p=self::payload($input);$hash=hash('sha256',json_encode($p,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR));$now=$this->now();
        return $this->atomic(function()use($actor,$p,$hash,$now){
            $run=$this->query('SELECT * FROM runs WHERE id=?',[$p['runId']])->fetch();
            if(!$run||!hash_equals($run['browser'],$actor)||!hash_equals($run['nonce_hash'],hash('sha256',$p['nonce'])))throw new ApiError(403,'run_invalid','このプレイの登録情報を確認できませんでした。');
            if($p['difficulty']!==$run['difficulty']||$p['ruleset']!==$run['ruleset']||$p['ruleset']!==self::RULESET||$p['seed']!==(int)$run['seed'])throw new ApiError(409,'rules_changed','登録対象のルールが変わりました。新しいプレイでお試しください。');
            if($run['response']!==null){if(!hash_equals($run['payload_hash'],$hash))throw new ApiError(409,'already_submitted','このプレイは別の内容ですでに登録済みです。');return json_decode($run['response'],true,512,JSON_THROW_ON_ERROR);}
            if($now>(float)$run['expires'])throw new ApiError(410,'run_expired','登録期限（開始から2時間）を過ぎました。');
            if($p['time']>$now-(float)$run['started']+2)throw new ApiError(422,'elapsed_mismatch','プレイ時間の整合性を確認できませんでした。');
            $this->limit('finish:'.$actor,30,60,$now);
            $old=$this->query('SELECT * FROM scores WHERE browser=? AND difficulty=? AND ruleset=?',[$actor,$run['difficulty'],self::RULESET])->fetch();
            $stage=$p['completedStages'];$improved=!$old||$p['score']>(int)$old['score']||($p['score']===(int)$old['score']&&$stage>(int)$old['stage']);
            if($improved){
                // Update the existing row in place: REPLACE would change its ID.
                if($old)$this->query('UPDATE scores SET name=?,score=?,stage=?,cleared=?,recorded=? WHERE id=?',[$p['name'],$p['score'],$stage,$p['result']==='stage-clear'?1:0,$now,$old['id']]);
                else $this->query('INSERT INTO scores(browser,difficulty,ruleset,name,score,stage,cleared,recorded) VALUES(?,?,?,?,?,?,?,?)',[$actor,$run['difficulty'],self::RULESET,$p['name'],$p['score'],$stage,$p['result']==='stage-clear'?1:0,$now]);
            }
            $best=$this->query('SELECT * FROM scores WHERE browser=? AND difficulty=? AND ruleset=?',[$actor,$run['difficulty'],self::RULESET])->fetch();
            if($improved){
                $details=json_encode(self::recordDetails($p),JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION|JSON_THROW_ON_ERROR);
                if($this->query('SELECT 1 FROM score_details WHERE score_id=?',[$best['id']])->fetchColumn()!==false)$this->query('UPDATE score_details SET version=1,score=?,stage=?,recorded=?,details=? WHERE score_id=?',[$best['score'],$best['stage'],$best['recorded'],$details,$best['id']]);
                else $this->query('INSERT INTO score_details(score_id,version,score,stage,recorded,details) VALUES(?,1,?,?,?,?)',[$best['id'],$best['score'],$best['stage'],$best['recorded'],$details]);
            }
            $rank=1+(int)$this->query('SELECT COUNT(*) FROM scores WHERE ruleset=? AND difficulty=? AND (score>? OR (score=? AND stage>?) OR (score=? AND stage=? AND recorded<?) OR (score=? AND stage=? AND recorded=? AND id<?))',[self::RULESET,$run['difficulty'],$best['score'],$best['score'],$best['stage'],$best['score'],$best['stage'],$best['recorded'],$best['score'],$best['stage'],$best['recorded'],$best['id']])->fetchColumn();
            $response=['accepted'=>true,'improved'=>$improved,'entry'=>$this->publicEntry($best,$rank),'ruleset'=>self::RULESET];
            $this->query('UPDATE runs SET payload_hash=?,response=?,completed=? WHERE id=?',[$hash,json_encode($response,JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION|JSON_THROW_ON_ERROR),$now,$run['id']]);
            return $response;
        });
    }
    private function publicEntry(array $row,int $rank):array {
        $raw=$this->query('SELECT details FROM score_details WHERE score_id=? AND version=1 AND score=? AND stage=? AND recorded=?',[$row['id'],$row['score'],$row['stage'],$row['recorded']])->fetchColumn();
        return ['rank'=>$rank,'name'=>$row['name'],'score'=>(int)$row['score'],'stage'=>min(3,(int)$row['stage']+1),'clear'=>(bool)$row['cleared'],'details'=>$raw===false?null:json_decode($raw,true,512,JSON_THROW_ON_ERROR)];
    }
    public function top(string $difficulty):array {
        self::difficulty($difficulty);$rows=$this->query('SELECT id,name,score,stage,cleared,recorded FROM scores WHERE ruleset=? AND difficulty=? ORDER BY score DESC,stage DESC,recorded ASC,id ASC LIMIT 10',[self::RULESET,$difficulty])->fetchAll();
        return ['ruleset'=>self::RULESET,'difficulty'=>$difficulty,'entries'=>array_map(fn($row,$index)=>$this->publicEntry($row,$index+1),$rows,array_keys($rows))];
    }
}
