# Docker起動手順

Phase6では、開発確認用に以下の3サービスをDocker Composeで起動します。

| Service | Role | URL |
| --- | --- | --- |
| frontend | Next.js 15 | http://localhost:3000 |
| backend | Laravel 12 API | http://localhost:8000 |
| postgres | PostgreSQL 16 | localhost:5432 |

## 初回セットアップ

```bash
cp .env.example .env
docker compose up --build
```

すでにローカルで3000番や8000番を使っている場合:

```bash
FRONTEND_PORT=3100 BACKEND_PORT=8100 NEXT_PUBLIC_API_BASE_URL=http://localhost:8100/api docker compose up --build
```

起動時にbackendコンテナで以下を実行します。

- `composer install`
- `php artisan config:clear`
- `php artisan migrate --force`
- `php artisan db:seed --force`
- `php artisan serve --host=0.0.0.0 --port=${PORT:-8000}`

## Gemini APIキー

AI旅ガイドを実際に使う場合は、ルートの `.env` に設定します。

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
```

キーが未設定でもアプリ自体は起動します。AI旅ガイドAPIだけが503を返します。

## よく使うコマンド

```bash
docker compose up
docker compose up --build
docker compose down
docker compose logs -f backend
docker compose logs -f frontend
```

DBデータを完全に消す場合:

```bash
docker compose down -v
```

## API確認

```bash
curl http://localhost:8000/api/spots
```

## フロントエンド確認

ブラウザで開きます。

```text
http://localhost:3000
```

## 画像差し替え方法

このアプリは画像をアップロード保存しません。スポット画像は `spots.image_url` のURLを表示します。

SeederのダミーURLを変更する場合:

```text
backend/database/seeders/SpotSeeder.php
```

画像URLが壊れている場合、フロントエンドは以下のデフォルト画像を表示します。

```text
frontend/public/images/default-mystic-bg.png
```

## 音楽差し替え方法

音楽もアップロード保存しません。`spots.music_url` のURLを変更してください。

`music_url` がない場合、画面では「BGM準備中」と表示します。

## 注意

- Docker Composeは開発確認用です。
- Render本番デプロイ設定は [Renderデプロイ手順](./09-render.md) を確認してください。
- `frontend` からブラウザ経由でLaravel APIへアクセスするため、`NEXT_PUBLIC_API_BASE_URL` は `http://localhost:8000/api` にしています。
