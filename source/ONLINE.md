# オンラインランキングについて

通常プレイの開始時に、このゲームと同じサーバーへ難しさとルール版を送り、今回のプレイ番号と乱数seedを受け取ります。接続できない場合もゲームは遊べますが、その回はオンライン登録できません。練習と検証用プレイ、過去の端末内記録は登録しません。

結果画面で登録ボタンを押したときだけ、入力した名前、得点、難しさ、到達面、クリア状況、プレイ時間、ライフ、撃破・返却・連鎖・被弾・星返しの回数、回復した回数、得点内訳（倍率込みの撃破得点・返却得点・ボス撃破時のライフ得点）、今回のプレイ番号を送信します。名前・得点・難しさ・到達面・クリア状況・順位と、プレイ時間・ライフ・撃破数・返却数・最高連続撃破数・被弾回数・星返し使用回数・回復した回数・得点内訳はランキングに公開されます。本名、連絡先、他人の個人情報を入力しないでください。

匿名のブラウザ識別Cookie（最長1年、HttpOnly、SameSite=Lax）を使い、ブラウザごと・難しさごとに最高記録を1件保存します。同点は到達面、先に登録した順で並びます。端末やブラウザを変えたりCookieを消すと別の記録となり、アカウント同期はありません。端末内記録の削除はオンライン記録の削除ではありません。

登録期限は開始から2時間です。通信失敗時は、この結果画面で同じ名前・結果を再送できます。画面を閉じる、タイトルへ戻る、次のプレイを始めると未送信内容は失われます。登録確認が不明な場合も同じ内容を再送することで重複登録を防ぎます。

サーバーには最高記録と、そのプレイの詳細、匿名識別子を保存します。同点で到達面も同じ記録や低い記録で、最高記録の詳細を置き換えません。旧記録で保存していない詳細は「未記録」と表示し、過去の受付情報から復元しません。旧サーバーが詳細受付に対応していない場合は従来の送信項目だけを送り、回復回数と得点内訳を追加送信しません。未完のプレイ受付情報は2時間の受付期限から1日後、完了した再送照合情報は7日後を目安に、次の受付時に整理します。不正な大量送信の制限用に、IPアドレスから日替わり鍵付きハッシュを作り短時間保存します。ランキング用データベースに生のIPアドレスを保存しません。ホスティングサーバーの通常アクセスログは別管理です。

得点はクライアントからの申告値に整合性検査を行う方式です。ゲーム全体のリプレイをサーバーで再計算した記録ではありません。

## English

Normal runs contact the same-origin server to obtain a run ID and seed. The game remains playable offline, but that run cannot be submitted. Practice, diagnostic runs, and older local records are excluded. Names and results are sent only when you press the submission button. Your nickname, score, difficulty, stage, clear status, rank, play time, remaining life, defeats, returned bullets, best combo, hits, capture uses, healing events, and score breakdown become public; do not enter personal information.

An anonymous browser cookie identifies one best record per difficulty. There is no account or cross-device sync. Submit within two hours; retries use the same frozen result. Leaving the result screen discards pending submission data. Clearing local records does not delete online records. Scores are validated for consistency, not independently replayed by the server.

Details belong to the saved best run. Missing historical details are shown as unrecorded, never as zero. The breakdown separates defeat points (including multipliers), return points, and pre-heal life bonuses for boss defeats. Older servers receive only the original payload; older clients can still submit base statistics.
