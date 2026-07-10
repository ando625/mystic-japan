# 日本神秘紀行

**AIでどこまでWebアプリを作れるのかを試した、和風ファンタジーRPG風のポートフォリオ**

> Next.js × Laravel × PostgreSQL × Gemini API × ChatGPT企画・画像 × SUNO音楽 × Codex開発

---

## アプリの概要

このアプリを一言で言うと、**「日本の神秘スポットをゲームの図鑑のように巡る、和風ファンタジーWebアプリ」**です。

普通の旅行サイトではなく、ゲームのメニュー画面や図鑑のような体験を目指しています。

ユーザーは日本地図や図鑑からスポットを選び、画像・BGM・神話・歴史・豆知識を見ながら、その場所にまつわる物語を楽しめます。

さらに、神話クイズで4問中3問以上正解すると、御朱印を獲得し、そのスポットが解放されます。



https://github.com/user-attachments/assets/56cdc512-cb47-42dd-bfdd-b8605db25316     







https://github.com/user-attachments/assets/b0e329e1-9628-48a1-91f0-97d78576db6e   





---

## この作品で一番伝えたいこと

このアプリは、**AIを使ってどこまで本格的なWebアプリを作れるか**を試すために作りました。

企画、コンセプト整理、世界観の方向性づくりには **ChatGPT** を使っています。

コードは **Codex** を使って作成しています。

画像は **ChatGPT** を使って作成しています。

音楽は **SUNO AI** を使って作成しています。

つまり、この作品は単なるWebアプリではなく、**AIを使った企画・デザイン・開発・素材制作の実験ポートフォリオ**です。

「AIを使えば、個人でもゲームのような世界観を持つWebアプリをどこまで作れるのか」をテーマにしています。

---

## 開発背景

最近は、AIを使えば文章・画像・音楽・コードをかなり高いレベルで作れるようになっています。

そこで、ただ小さな機能を作るだけではなく、**世界観のある1つのアプリをAIと一緒に作り切る**ことに挑戦しました。

テーマには、日本の神話・神社・絶景・旅行を選びました。

理由は、画像や音楽との相性がよく、ゲームのような体験にしやすいからです。

このアプリでは、観光情報をただ並べるのではなく、ユーザーが少しずつ場所を解放していく「図鑑RPG」のような形にしています。

---

## こだわったポイント

### 1. AIで作った世界観

このアプリの大きな特徴は、コードだけでなく、画像や音楽もAIを使って作っていることです。

- コード: Codex
- 企画・コンセプト整理: ChatGPT
- 画像: ChatGPT
- 音楽: SUNO AI
- AI旅ガイド: Gemini API

開発・見た目・音・AI会話まで、できるだけAIを活用しています。

### 2. 旅行サイトではなくゲームUI

明るい観光サイトではなく、夜空・紫・青・神社・神秘的な光を使い、和風ファンタジーRPGのような雰囲気を目指しました。

ホーム画面、スポット詳細、御朱印帳、クイズ画面も、ゲームのメニュー画面を意識しています。

### 3. スポットを解放していく体験

スポットはただ見るだけではなく、ユーザーごとに解放状態を持っています。
スポットは、御朱印を獲得した時に解放されます。

御朱印は、各スポットの神話クイズで4問中3問以上正解すると獲得できます。

進行状況はDBに保存されるため、リロードしても状態が残ります。

### 4. 御朱印コレクション

神話クイズで4問中3問以上正解すると、御朱印を獲得できます。

御朱印帳では、取得済みと未取得を分けて表示します。

### 5. 神話クイズ

スポットごとに神話や歴史に関する4択クイズがあります。

正解するとポイントが入り、4問中3問以上正解すると御朱印がもらえます。

同じクイズで報酬が何度も増えないようにしています。

3問正解できなかった場合は、御朱印を獲得するまで「もう一回」ボタンから何度でも再挑戦できます。

### 6. AI旅ガイド

スポットについて質問できるAIガイドを用意しています。

Next.jsからLaravel APIを呼び、LaravelからGemini APIへ質問を送ります。

スポット名・神話・歴史・豆知識などをプロンプトに入れることで、その場所に合った回答を返せるようにしています。

### 7. BGMつきの体験

アプリ全体のBGMと、スポットごとのBGMを用意しています。

音楽はSUNO AIで作成しています。

画像だけでなく音も使うことで、ゲームのような没入感を出しています。

### 8. 画像がゆっくり動く演出

スポット詳細では、画像が少しずつズームしたり動いたりします。

本物の動画ではなく、Framer Motionを使って静止画を動画のように見せています。

### 9. Render無料枠へのデプロイ

Renderで動かせるように、`render.yaml` とDockerfileを用意しています。

画像や音楽はアップロード保存ではなく、URLやpublic配下のファイルとして扱う形にしています。

---

## 主な機能

- ホーム画面
- 日本地図
- スポット一覧
- スポット詳細
- 複数画像の切り替え
- BGM再生
- AI旅ガイド
- ログイン / 新規登録
- スポット解放
- 御朱印帳
- 神話クイズ
- 称号 / 実績
- コレクション進捗
- Renderデプロイ設定

---

## 使用技術

### フロントエンド

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack Query
- Zustand
- React Leaflet

### バックエンド

- Laravel 12
- Laravel Sanctum
- REST API
- PostgreSQL

### AI

- Codex: コード作成、設計、リファクタリング
- ChatGPT: 企画、コンセプト整理、世界観づくり、画像作成
- SUNO AI: BGM作成
- Gemini API: AI旅ガイド

### 開発・デプロイ

- Docker Compose
- Dockerfile
- Render
- GitHub

---

## 画面とファイルの場所

### フロントエンド

画面は主に `frontend/src/app` にあります。

| 画面 | ファイル |
| --- | --- |
| ホーム | `frontend/src/app/page.tsx` |
| 地図 | `frontend/src/app/map/page.tsx` |
| スポット一覧 | `frontend/src/app/spots/page.tsx` |
| スポット詳細 | `frontend/src/app/spots/[id]/page.tsx` |
| AI旅ガイド | `frontend/src/app/spots/[id]/guide/page.tsx` |
| 神話クイズ | `frontend/src/app/spots/[id]/quiz/page.tsx` |
| 御朱印帳 | `frontend/src/app/stamps/page.tsx` |
| 称号 | `frontend/src/app/achievements/page.tsx` |
| コレクション | `frontend/src/app/collection/page.tsx` |
| ログイン | `frontend/src/app/login/page.tsx` |

### よく使うUI部品

| 内容 | ファイル |
| --- | --- |
| スポットカード | `frontend/src/components/spot/SpotCard.tsx` |
| スポット画像表示 | `frontend/src/components/spot/SpotDetailMedia.tsx` |
| 動く画像演出 | `frontend/src/components/spot/AnimatedSpotImage.tsx` |
| AIガイド | `frontend/src/components/spot/AiGuideChat.tsx` |
| BGMパネル | `frontend/src/components/spot/BgmPanel.tsx` |
| 御朱印パネル | `frontend/src/components/spot/SpotStampPanel.tsx` |
| 神話/歴史/豆知識タブ | `frontend/src/components/spot/SpotStoryTabs.tsx` |
| 下部ナビ | `frontend/src/components/ui/BottomNav.tsx` |
| 御朱印表示 | `frontend/src/components/stamp/StampSeal.tsx` |

### フロントの状態管理

| 内容 | ファイル |
| --- | --- |
| ログイン状態 | `frontend/src/stores/auth-store.ts` |
| BGM状態 | `frontend/src/stores/bgm-store.ts` |
| 進行状態 | `frontend/src/stores/progress-store.ts` |
| API呼び出し | `frontend/src/lib/api.ts` |
| APIの型 | `frontend/src/types/api.ts` |
| アプリの型 | `frontend/src/types/domain.ts` |

### 画像と音楽

| 内容 | 場所 |
| --- | --- |
| ホーム画像 | `frontend/public/images/home` |
| スポット画像 | `frontend/public/images/spots` |
| BGM | `frontend/public/music` |
| アプリ共通BGM設定 | `frontend/src/data/app-bgm.ts` |

---

## バックエンドのファイル

### APIルート

```txt
backend/routes/api.php
```

APIのURLが書かれています。

### Controller

| 内容 | ファイル |
| --- | --- |
| 認証 | `backend/app/Http/Controllers/Api/AuthController.php` |
| スポット | `backend/app/Http/Controllers/Api/SpotController.php` |
| 御朱印 | `backend/app/Http/Controllers/Api/StampController.php` |
| クイズ | `backend/app/Http/Controllers/Api/QuizController.php` |
| AI旅ガイド | `backend/app/Http/Controllers/Api/AiGuideController.php` |
| 称号 | `backend/app/Http/Controllers/Api/AchievementController.php` |
| コレクション | `backend/app/Http/Controllers/Api/CollectionController.php` |

### Service

| 内容 | ファイル |
| --- | --- |
| ゲーム進行 | `backend/app/Services/ProgressService.php` |
| AI旅ガイド | `backend/app/Services/AiGuideService.php` |
| 称号判定 | `backend/app/Services/AchievementService.php` |

### Model

| 内容 | ファイル |
| --- | --- |
| スポット | `backend/app/Models/Spot.php` |
| 御朱印 | `backend/app/Models/Stamp.php` |
| クイズ | `backend/app/Models/Quiz.php` |
| ユーザーのスポット進行 | `backend/app/Models/UserSpot.php` |
| ユーザーの御朱印 | `backend/app/Models/UserStamp.php` |
| クイズ回答 | `backend/app/Models/QuizAnswer.php` |
| 称号 | `backend/app/Models/Achievement.php` |

### 初期データ

| 内容 | ファイル |
| --- | --- |
| スポット | `backend/database/seeders/SpotSeeder.php` |
| 御朱印 | `backend/database/seeders/StampSeeder.php` |
| クイズ | `backend/database/seeders/QuizSeeder.php` |
| 称号 | `backend/database/seeders/AchievementSeeder.php` |
| デモユーザー | `backend/database/seeders/DemoUserSeeder.php` |

---

## データの流れ

### スポット詳細を見る流れ

```txt
Next.js
  ↓
Laravel API
  ↓
PostgreSQL
  ↓
Laravel API
  ↓
Next.jsで表示
```

### AI旅ガイドの流れ

```txt
Next.jsで質問
  ↓
Laravel API
  ↓
Gemini API
  ↓
Laravel API
  ↓
Next.jsに回答を表示
```

### 御朱印を獲得する流れ

```txt
神話クイズで4問中3問以上正解
  ↓
Laravel API
  ↓
user_stamps に保存
  ↓
user_spots / collections に解放状態を保存
  ↓
御朱印帳で取得済み表示
```

3問正解できなかった場合は、クイズ画面下部の「もう一回」ボタンで、そのスポットの回答履歴をリセットして再挑戦できます。

---

## 開発で学んだこと

### 1. AIを使うと開発スピードが大きく上がる

Codexを使うことで、画面、API、DB、Docker、Render設定まで一気に進められました。

ただし、AIが作ったコードをそのまま使うだけではなく、エラーを確認し、動作を見て、何度も直す必要がありました。

### 2. 画像と音楽もAIで作ると世界観を作りやすい

ChatGPTで画像を作り、SUNO AIでBGMを作ることで、個人開発でもゲームのような雰囲気を出せました。

コードだけでなく、素材もAIで作れることを体験できました。

### 3. フロントとバックエンドの状態を合わせるのが大事

スポット詳細では御朱印が取得済みなのに、御朱印帳では未取得になる問題がありました。

原因は、画面ごとに見ているAPIや状態がずれていたことです。

DBの状態を正しくAPIで返し、フロントで同じ状態を見ることの大切さを学びました。

### 4. 見た目を良くするには何度も調整が必要

AIで最初の形は作れますが、余白、カードの高さ、画像の見え方、スマホ表示などは、実際に見ながら何度も調整しました。

ゲームらしいUIに近づけるには、細かい修正がかなり大事でした。

---

## 開発コマンド

### フロントエンド

```bash
cd frontend
npm run lint
npm run build
```

### バックエンド

```bash
cd backend
php artisan test
```

### Docker

```bash
docker compose up -d --build
```

---

## ドキュメント

- [システム設計](./docs/01-system-design.md)
- [ER図](./docs/02-er-diagram.md)
- [DB設計・テーブル定義](./docs/03-database-design.md)
- [画面一覧・画面設計](./docs/04-screens.md)
- [画面遷移図](./docs/05-screen-flow.md)
- [API仕様書](./docs/06-api-spec.md)
- [UI/UXデザイン方針](./docs/07-ui-ux-direction.md)
- [Docker起動手順](./docs/08-docker.md)
- [Renderデプロイ手順](./docs/09-render.md)

---

