# API仕様書

## 前提

- Base URL: `/api`
- 認証: Laravel Sanctum
- Content-Type: `application/json`
- 認証が必要なAPIでは、未認証時に `401 Unauthorized` を返します。

## 認証

### POST `/register`

新規ユーザーを作成します。

Request:

```json
{
  "name": "旅人",
  "email": "traveler@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

Response:

```json
{
  "user": {
    "id": 1,
    "name": "旅人",
    "email": "traveler@example.com"
  }
}
```

### POST `/login`

ログインします。

Request:

```json
{
  "email": "traveler@example.com",
  "password": "password"
}
```

### POST `/logout`

ログアウトします。

認証: 必須

### GET `/me`

ログインユーザーと進捗サマリーを返します。

認証: 必須

Response:

```json
{
  "user": {
    "id": 1,
    "name": "旅人",
    "email": "traveler@example.com"
  },
  "summary": {
    "unlocked_count": 5,
    "total_spots": 14,
    "completion_rate": 35.7,
    "mystic_points": 850,
    "achievement_count": 2
  }
}
```

## スポット

### GET `/spots`

スポット一覧を返します。

Query:

| パラメータ | 必須 | 説明 |
| --- | --- | --- |
| category | no | カテゴリ絞り込み |
| region | no | エリア絞り込み |
| unlocked | no | 認証時のみ `true` / `false` で解放状態絞り込み |

Response:

```json
{
  "data": [
    {
      "id": 1,
      "name": "青い池",
      "region": "北の神秘",
      "prefecture": "北海道",
      "category": "sea_lake",
      "description": "青白い水面が森を映す幻想的な池。",
      "latitude": 43.4936,
      "longitude": 142.6146,
      "image_url": "https://example.com/images/blue-pond.jpg",
      "rarity": 4,
      "mystic_points": 100,
      "is_unlocked": false
    }
  ]
}
```

### GET `/spots/{spot}`

スポット詳細を返します。

Response:

```json
{
  "data": {
    "id": 1,
    "name": "青い池",
    "region": "北の神秘",
    "prefecture": "北海道",
    "category": "sea_lake",
    "description": "青白い水面が森を映す幻想的な池。",
    "mythology": "水鏡に精霊が宿ると語られる...",
    "history": "防災工事をきっかけに生まれた池...",
    "trivia": "季節や天候により青の色味が変化する。",
    "latitude": 43.4936,
    "longitude": 142.6146,
    "image_url": "https://example.com/images/blue-pond.jpg",
    "music_url": "https://example.com/music/blue-pond.mp3",
    "video_url": "https://example.com/videos/blue-pond.mp4",
    "rarity": 4,
    "mystic_points": 100,
    "is_unlocked": false
  }
}
```

### POST `/spots/{spot}/unlock`

スポットを解放します。

現在のUIでは手動解放ボタンを表示せず、通常は神話クイズで御朱印を獲得した時に解放します。
このAPIは既存実装との互換や管理用のために残しています。

認証: 必須

Response:

```json
{
  "collection": {
    "spot_id": 1,
    "unlocked_at": "2026-07-02T12:00:00+09:00"
  },
  "gained_points": 100,
  "new_achievements": [
    {
      "id": 1,
      "title": "鳥居の導き手"
    }
  ],
  "already_unlocked": false
}
```

### POST `/spots/{spot}/visit`

スポットの訪問日時だけを記録します。

現在の仕様では、訪問済みにしても御朱印は獲得しません。
御朱印は神話クイズで4問中3問以上正解した場合のみ獲得します。

認証: 必須

Response:

```json
{
  "spot_id": 1,
  "visited_at": "2026-07-02T12:00:00+09:00",
  "stamp_obtained": false,
  "stamp": null,
  "user_progress": {
    "is_unlocked": false,
    "unlocked_at": null,
    "visited_at": "2026-07-02T12:00:00+09:00",
    "stamp_obtained": false,
    "total_points": 0,
    "answered_quiz_ids": []
  }
}
```

## 神話クイズ

### GET `/spots/{spot}/quizzes`

スポットに紐づく4択クイズを返します。

認証: 任意

認証済みの場合は、そのユーザーの回答済み状態も含めます。

Response:

```json
{
  "data": [
    {
      "id": 1,
      "spot_id": 1,
      "question": "青い池の水に含まれている主な成分は何でしょう？",
      "options": {
        "A": "硫黄",
        "B": "アルミニウム",
        "C": "銅",
        "D": "鉄"
      },
      "reward_points": 30,
      "answered_at": null,
      "selected_option": null,
      "is_correct": null
    }
  ]
}
```

### POST `/quizzes/{quiz}/answer`

クイズへ回答します。

認証: 必須

正解するとクイズごとのポイントを獲得します。
同じクイズに再回答してもポイントは重複付与しません。

同じスポットの4問中3問以上正解すると、御朱印を獲得し、スポットも解放されます。

Request:

```json
{
  "selected_option": "B"
}
```

Response:

```json
{
  "quiz_id": 1,
  "selected_option": "B",
  "correct_option": "B",
  "is_correct": true,
  "already_answered": false,
  "reward_points": 30,
  "explanation": "白金温泉の湧水に含まれるアルミニウムが...",
  "stamp_obtained": false,
  "stamp_newly_obtained": false,
  "stamp": null,
  "spot_unlocked": false,
  "correct_answers_count": 1,
  "required_correct_answers": 3,
  "visited": false,
  "user_progress": {
    "is_unlocked": false,
    "unlocked_at": null,
    "visited_at": null,
    "stamp_obtained": false,
    "total_points": 30,
    "answered_quiz_ids": [1]
  }
}
```

### POST `/spots/{spot}/quizzes/retry`

神話クイズを再挑戦するため、そのスポットの回答履歴をリセットします。

認証: 必須

御朱印未獲得で、4問回答後に3問正解できなかった場合に使います。
御朱印獲得済み、またはすでに3問以上正解済みの場合はリセットしません。

Response:

```json
{
  "can_retry": true,
  "deleted_answers": 4,
  "correct_answers_count": 0,
  "required_correct_answers": 3,
  "answered_quiz_ids": []
}
```

## 図鑑・コレクション

### GET `/collections`

ユーザーの解放済みスポットを返します。

認証: 必須

Response:

```json
{
  "summary": {
    "unlocked_count": 5,
    "total_spots": 14,
    "completion_rate": 35.7,
    "mystic_points": 850
  },
  "data": [
    {
      "spot_id": 1,
      "unlocked_at": "2026-07-02T12:00:00+09:00"
    }
  ]
}
```

## 称号

### GET `/achievements`

称号一覧とユーザーの達成状態を返します。

認証: 必須

Response:

```json
{
  "data": [
    {
      "id": 1,
      "title": "鳥居の導き手",
      "description": "神社・仏閣スポットを3か所解放する",
      "condition_type": "category_unlock_count",
      "condition_value": 3,
      "icon_name": "Badge",
      "reward_points": 50,
      "is_earned": false,
      "progress": {
        "current": 2,
        "target": 3
      }
    }
  ]
}
```

## AI旅ガイド

### POST `/ai/guide`

スポット情報を文脈に含めてGemini APIへ質問します。

認証: 必須

Model: `gemini-2.5-flash`

Request:

```json
{
  "spot_id": 1,
  "message": "青い池って冬でも綺麗？"
}
```

Laravel側でプロンプトへ追加する情報:

- スポット名
- 説明
- 神話
- 歴史
- 豆知識
- 都道府県
- カテゴリ

Response:

```json
{
  "answer": "はい。冬の青い池は雪景色と青い水面の対比が幻想的です...",
  "spot_id": 1,
  "model": "gemini-2.5-flash"
}
```

## エラーレスポンス

```json
{
  "message": "Validation failed.",
  "errors": {
    "message": ["質問を入力してください。"]
  }
}
```

## ステータスコード

| Code | 用途 |
| --- | --- |
| 200 | 取得・更新成功 |
| 201 | 作成成功 |
| 400 | 不正なリクエスト |
| 401 | 未認証 |
| 403 | 権限なし |
| 404 | 対象なし |
| 422 | バリデーションエラー |
| 500 | サーバーエラー |
