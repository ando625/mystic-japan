# Renderデプロイ手順

Render Blueprintで以下の2サービスを作成し、データベースは Neon の PostgreSQL を使います。

| Resource | 置き場所 | Role | Plan |
| --- | --- | --- | --- |
| `mystic-japan-web` | Render Web Service / Docker | Next.js frontend | free |
| `mystic-japan-api` | Render Web Service / Docker | Laravel API | free |
| `mystic-japan` | Neon（AWS Asia Pacific 1 (Singapore)） | PostgreSQL 16 | free |

最初は Render Postgres を使っていましたが、Render の無料のデータベースは作成から30日で消えるため、2026年11月に期限の無い Neon の無料プランへ移しました。

## 事前準備

1. GitHubにこのリポジトリをpushします。
2. Renderのアカウントを作成します。
3. Neon でプロジェクトを作り、接続文字列を用意します（下の「Neonでデータベースを作成」）。
4. Gemini APIを使う場合は `GEMINI_API_KEY` を用意します。
5. LaravelのAPP_KEYをローカルで生成します。

```bash
cd backend
php artisan key:generate --show
```

表示された `base64:...` 形式の値を、Render作成時に `APP_KEY` へ入力します。

## Neonでデータベースを作成

1. https://neon.com でアカウントを作り、新しいプロジェクトを作ります。

| 欄 | 値 |
| --- | --- |
| Project name | `mystic-japan` |
| Region | AWS Asia Pacific 1 (Singapore)（Renderのサービスと同じ地域） |
| Postgres version | 16 |
| Database name | `mystic_japan` |

2. プロジェクトの `Connect` から、接続文字列（`postgresql://...`）をコピーします。Connection pooling はオフ（直接接続）にします。起動時の `migrate` を確実に通すためです。
3. 接続文字列にはパスワードが入っているため、GitHub やチャットに貼らないでください。

Neon の無料プランは期限が無く、使われないときは5分で計算部分が止まり、次の接続で自動で戻ります（https://neon.com/pricing ）。

## Blueprintで作成

1. Render Dashboardを開きます。
2. `New` から `Blueprint` を選択します。
3. GitHubリポジトリを選択します。
4. ルートにある `render.yaml` を使って作成します。
5. 作成画面で以下の秘密値を入力します。

| Key | Required | Value |
| --- | --- | --- |
| `APP_KEY` | Yes | `php artisan key:generate --show` の結果 |
| `DB_URL` | Yes | Neon の接続文字列 |
| `GEMINI_API_KEY` | No | AI旅ガイドを使う場合のみ入力 |
| `NEXT_PUBLIC_CARTO_API_KEY` | No（地図に必要） | `mystic-japan-web` に入力。CARTO の地図タイルのキー（下の「地図タイルのAPIキー」） |

`GEMINI_API_KEY` が空でもデプロイ自体はできます。その場合、AI旅ガイドAPIは503を返します。

## 地図タイルのAPIキー

地図の画像は CARTO の `dark_all` を使っています。CARTO の地図タイルは API キーが必要で、無いと地図の代わりに「API KEY REQUIRED」の画像が出ます。

1. https://carto.com/basemaps/apikey で無料のキーを申し込みます（非商用なら月500万リクエストまで無料。メールで届きます）。
2. CARTO の管理画面で、キーを使えるドメインを `mystic-japan-web.onrender.com` と `localhost` に制限します。キーはブラウザから見えるためです。
3. Render の `mystic-japan-web` の Environment に `NEXT_PUBLIC_CARTO_API_KEY` を入れて、Manual Deploy します。`NEXT_PUBLIC_` の値はビルド時に埋め込まれるため、入れ直したら再デプロイが必要です。

地図には「© OpenStreetMap contributors © CARTO」の表示が必要です（`MysticMap.tsx` の attribution）。

## render.yamlの役割

`render.yaml` は以下を定義します。

- `backend/Dockerfile` からLaravel APIをDockerデプロイ
- `frontend/Dockerfile` からNext.jsをDockerデプロイ
- Laravelへ、画面で入力した Neon の接続文字列を `DB_URL` として渡す（`sync: false`）
- Neon は暗号化した接続が必須のため、`DB_SSLMODE` を `require` にする
- Next.jsへLaravel APIのURLを `NEXT_PUBLIC_API_ORIGIN_URL` として渡す
- Laravelの `FRONTEND_URL` / `CORS_ALLOWED_ORIGINS` / `SANCTUM_STATEFUL_DOMAINS` をRenderサービス参照で設定

Render Blueprintは変数の文字列結合に対応していないため、フロントエンド側で `NEXT_PUBLIC_API_ORIGIN_URL + "/api"` を組み立てています。

## デプロイ後の確認

作成が完了したら、Render Dashboardで以下を確認します。

| Check | Example |
| --- | --- |
| Frontend | `https://mystic-japan-web.onrender.com` |
| API health | `https://mystic-japan-api.onrender.com/api/spots` |
| Login demo user | `traveler@example.com` / `password` |

ログイン時にCORSエラーが出る場合は、APIサービス側の環境変数に以下が入っているか確認してください。

| Key | Example |
| --- | --- |
| `FRONTEND_URL` | `https://mystic-japan-web.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://mystic-japan-web.onrender.com` |
| `SANCTUM_STATEFUL_DOMAINS` | `mystic-japan-web.onrender.com` |

変更後は `mystic-japan-api` をManual Deployしてください。Laravelで設定キャッシュを使うため、環境変数を変えた後は再デプロイが必要です。

バックエンド起動時に以下を実行します。

- `php artisan migrate --force`
- `php artisan db:seed --force`
- `php artisan serve --host=0.0.0.0 --port=$PORT`

Seederは `updateOrCreate` を使っているため、再起動や再デプロイで重複データを作りにくい構成です。

## よくあるエラー

### `failed to read dockerfile: open Dockerfile: no such file or directory`

Renderが `frontend/Dockerfile` または `backend/Dockerfile` を読めていない状態です。

このプロジェクトでは `render.yaml` で以下のようにDockerfileの場所を指定しています。

```yaml
dockerfilePath: ./frontend/Dockerfile
dockerContext: ./frontend
```

確認してください。

- `render.yaml` をGitHubにpushしているか
- `frontend/Dockerfile` がGitHub上で見えるか
- `frontend` がsubmodule/gitlink扱いになっていないか
- Render DashboardでBlueprintを再同期、またはManual Deployしているか

ローカルで確認するコマンド:

```bash
git ls-tree HEAD frontend
git ls-files frontend/Dockerfile frontend/package.json
```

`git ls-tree HEAD frontend` が `160000 commit ... frontend` と表示される場合、`frontend` は通常フォルダではなくsubmodule扱いです。その場合は通常フォルダとしてGitに登録し直してからpushしてください。

## 画像・音楽の扱い

Render無料枠ではローカルファイルシステムが永続化されません。

このアプリでは、ユーザーアップロードを保存せず、以下のどちらかで扱います。

- フロントエンド同梱アセット: `frontend/public/images` / `frontend/public/music`
- 外部URL: `spots.image_url` / `spots.music_url` / `spots.video_url`

スポット画像・音楽を変える場合は [SpotSeeder.php](../backend/database/seeders/SpotSeeder.php) のURLを変更してpushします。

## 無料枠の注意

Render無料枠には次の制約があります。

- Free Web Serviceは15分程度アクセスがないとスリープします。
- スリープ復帰時は初回表示に時間がかかります。
- Free Web Serviceのローカルファイルは永続化されません。
- 無料Webサービス2つを長時間動かすと、月間無料インスタンス時間を消費します。
- Render の Free Postgres は作成から30日で期限切れになるため、このアプリでは使っていません（データベースは Neon）。

Neon の無料プランにも、1プロジェクトあたり 1GB の容量と、月100時間の計算時間の上限があります。実案件で継続運用する場合は、有料プランを前提に考えてください。

## 公式ドキュメント

- Render Blueprint: https://render.com/docs/blueprint-spec
- Docker on Render: https://render.com/docs/docker
- Render Free Instances: https://render.com/docs/free
- Neon Pricing: https://neon.com/pricing
- Render Default Environment Variables: https://render.com/docs/environment-variables
