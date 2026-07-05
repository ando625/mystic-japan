# Renderデプロイ手順

Phase7では、Render Blueprintで以下の3リソースを作成します。

| Resource | Render type | Role | Plan |
| --- | --- | --- | --- |
| `mystic-japan-web` | Web Service / Docker | Next.js frontend | free |
| `mystic-japan-api` | Web Service / Docker | Laravel API | free |
| `mystic-japan-db` | Render Postgres | PostgreSQL | free |

## 事前準備

1. GitHubにこのリポジトリをpushします。
2. Renderのアカウントを作成します。
3. Gemini APIを使う場合は `GEMINI_API_KEY` を用意します。
4. LaravelのAPP_KEYをローカルで生成します。

```bash
cd backend
php artisan key:generate --show
```

表示された `base64:...` 形式の値を、Render作成時に `APP_KEY` へ入力します。

## Blueprintで作成

1. Render Dashboardを開きます。
2. `New` から `Blueprint` を選択します。
3. GitHubリポジトリを選択します。
4. ルートにある `render.yaml` を使って作成します。
5. 作成画面で以下の秘密値を入力します。

| Key | Required | Value |
| --- | --- | --- |
| `APP_KEY` | Yes | `php artisan key:generate --show` の結果 |
| `GEMINI_API_KEY` | No | AI旅ガイドを使う場合のみ入力 |

`GEMINI_API_KEY` が空でもデプロイ自体はできます。その場合、AI旅ガイドAPIは503を返します。

## render.yamlの役割

`render.yaml` は以下を定義します。

- `backend/Dockerfile` からLaravel APIをDockerデプロイ
- `frontend/Dockerfile` からNext.jsをDockerデプロイ
- Render Postgresを作成
- LaravelへPostgres接続文字列を `DB_URL` として渡す
- Next.jsへLaravel APIのURLを `NEXT_PUBLIC_API_ORIGIN_URL` として渡す
- Laravelの `FRONTEND_URL` / `SANCTUM_STATEFUL_DOMAINS` をRenderサービス参照で設定

Render Blueprintは変数の文字列結合に対応していないため、フロントエンド側で `NEXT_PUBLIC_API_ORIGIN_URL + "/api"` を組み立てています。

## デプロイ後の確認

作成が完了したら、Render Dashboardで以下を確認します。

| Check | Example |
| --- | --- |
| Frontend | `https://mystic-japan-web.onrender.com` |
| API health | `https://mystic-japan-api.onrender.com/api/spots` |
| Login demo user | `traveler@example.com` / `password` |

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
- Free Postgresは1ワークスペース1個までです。
- Free Postgresは作成から30日で期限切れになります。
- 無料Webサービス2つを長時間動かすと、月間無料インスタンス時間を消費します。

実案件で継続運用する場合は、少なくともPostgresを有料プランへ上げる前提で考えてください。

## 公式ドキュメント

- Render Blueprint: https://render.com/docs/blueprint-spec
- Docker on Render: https://render.com/docs/docker
- Render Free Instances: https://render.com/docs/free
- Render Default Environment Variables: https://render.com/docs/environment-variables
