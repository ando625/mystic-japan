# 日本神秘紀行 ～神々の記憶を巡る旅～

「図鑑 × RPG × 神話 × AI × 旅行」を融合した、幻想的な和風ファンタジーWebアプリです。

このリポジトリは、ユーザーレビューを挟みながら段階的に開発します。現在は **Phase7: Render無料枠デプロイ設定 レビュー待ち** です。

## 開発フェーズ

| Phase | 内容 | 状態 |
| --- | --- | --- |
| Phase1 | システム設計 / ER図 / 画面設計 / API設計 / DB設計 | 完了 |
| Phase2 | Laravel API / DB / Sanctum / Seeder | 完了 |
| Phase3 | Next.js / UI / 状態管理 / 地図 / 図鑑 | 完了 |
| Phase4 | AI旅ガイド / Gemini API連携 | 完了 |
| Phase5 | Framer Motion / 演出 / ページ遷移 / パララックス | 完了 |
| Phase6 | Docker Compose / Dockerfile / .env.example | 完了 |
| Phase7 | Render無料枠デプロイ設定 / render.yaml | レビュー待ち |

## Phase1 ドキュメント

- [システム設計](./docs/01-system-design.md)
- [ER図](./docs/02-er-diagram.md)
- [DB設計・テーブル定義](./docs/03-database-design.md)
- [画面一覧・画面設計](./docs/04-screens.md)
- [画面遷移図](./docs/05-screen-flow.md)
- [API仕様書](./docs/06-api-spec.md)
- [UI/UXデザイン方針](./docs/07-ui-ux-direction.md)
- [Docker起動手順](./docs/08-docker.md)
- [Renderデプロイ手順](./docs/09-render.md)

## 設計上の重要方針

- 旅行サイトではなく、和風ファンタジーRPGのメニュー画面として設計する。
- 初心者が追いやすい Laravel 標準構成を使い、Repository / DDD は採用しない。
- 画像・音楽・動画はアップロード保存せず、DBにURLのみ保持する。
- AI旅ガイドは Next.js から Laravel API を経由し、Laravel から Gemini API を呼び出す。
- Render無料枠を前提に、バックエンド・フロントエンド・PostgreSQLを分離して設計する。

## レビュー観点

Phase7レビューでは、以下を確認してください。

- `render.yaml` のサービス名・リージョン・無料枠前提に違和感がないか
- Render作成時に `APP_KEY` / `GEMINI_API_KEY` を手入力する運用でよいか
- Free Postgresの30日期限を許容できるか
