# ランキングサーバー / Ranking server

同一originの任意ランキングを提供するPHP + SQLite実装です
Gitでのコード公開と、Webから直接読める場所への配置は別です
serverはDocumentRootの外へ配置し、公開入口はsource/api/index.phpだけにしてください

## ローカル起動

PHP 8.3以上、PDO_SQLITE、mbstringが必要です
Windowsではプロジェクト直下から実行できます

```powershell
./scripts/start-ranking-local.ps1 -Port 8900
```

127.0.0.1だけで待ち受け、DocumentRootをsourceに限定します
データはdevelopment/qa-ranking-<port>へ作られます
試験には未使用のポートと新しい合成データ領域を使い、既存DBと鍵を上書きしないでください

## 配置設定

PHPの実行環境へ設定します — 値をソースやGitへ保存しないでください

| 環境変数 | 設定内容 |
|---|---|
| STAR_REBOUND_SERVER_DIR | このserverフォルダーの絶対パス |
| STAR_REBOUND_DATA_DIR | Webから読めない専用データディレクトリ |
| STAR_REBOUND_ALLOWED_ORIGIN | 実際のHTTPS origin、パス・末尾スラッシュなし |

SERVER_DIRが未設定の場合だけ、DocumentRootの親のprivate/hoshigaeshiを探します
DATA_DIRとALLOWED_ORIGINには既定値がありません
HTTPはloopbackホストに限ります

DBとランダム署名鍵は専用データ領域へ生成します
コードは実体パスが現在のDocumentRoot内なら拒否しますが、別vhost・alias・バックアップURLやOSの権限も運用側で確認してください
PHP実行者と管理者だけがDBと鍵へアクセスできる権限にし、DBと鍵を対で保全してください
既存DB・鍵の削除や作り直しは、利用者の記録・所有権へ影響します

## データと制御

- APIはtop / start / finishのみ
- POSTのOrigin、JSON形式、8KiB上限を検査
- 署名Cookie、runごとのnonce、actor照合、期限と申告値の整合性を検査
- prepared statementとtransactionで最高記録・詳細・再送応答を保存
- 同一内容の再送は同じ応答、変更された再送は拒否
- 名前や記録はHTMLとして解釈せずtextContentで表示

ランキングは匿名ブラウザごとの記録です
サーバーで全プレイを再実行する方式ではなく、整合的な申告値によるチートを完全には防げません
送信項目、Cookie、保存期間は [ONLINE.md](../source/ONLINE.md) を参照してください

基礎schemaはuser_version=1、詳細はscore_detailsのversion=1です
旧記録は詳細未記録として読み、旧client payloadも受け付けます
SQLiteのUPSERT構文へ依存せず、同一transaction内のINSERT/UPDATEで既存row IDを維持します
コードを戻す場合も既存DBと鍵を保持し、利用環境のSQLite互換性を確認してください

## English

The optional same-origin ranking service requires PHP 8.3+, PDO SQLite and mbstring. Serve only source/; place server/ outside DocumentRoot. The public entry point is source/api/index.php.

Set the three environment variables above in the PHP runtime, never in committed source. SERVER_DIR selects private code; DATA_DIR selects private data; ALLOWED_ORIGIN is the exact HTTPS origin without a path. HTTP is allowed only for loopback hosts. Without SERVER_DIR, the entry point looks in private/hoshigaeshi beside DocumentRoot. The other variables have no defaults.

Check OS permissions and all aliases/vhosts/backups for accidental exposure. The application's realpath check covers its current DocumentRoot only. Back up and restore the database and key together. Never copy test data into production.

Requests use bounded JSON, origin checks, signed anonymous cookies, per-run nonces, prepared SQL and atomic writes. Identical result retries are idempotent. Ranking validates client-reported results but does not replay the game and cannot guarantee cheat prevention. Accounts and an administration UI are not included.
