# ER図

```mermaid
erDiagram
  users ||--o{ collections : unlocks
  users ||--o{ user_spots : progresses
  users ||--o{ user_stamps : obtains
  users ||--o{ quiz_answers : answers
  users ||--o{ user_achievements : earns
  achievements ||--o{ user_achievements : granted_as
  spots ||--o{ collections : collected_as
  spots ||--o{ user_spots : progressed_as
  spots ||--|| stamps : has
  spots ||--o{ quizzes : asks
  stamps ||--o{ user_stamps : obtained_as
  quizzes ||--o{ quiz_answers : answered_as

  users {
    bigint id PK
    string name
    string email UK
    timestamp email_verified_at
    string password
    string remember_token
    timestamp created_at
    timestamp updated_at
  }

  spots {
    bigint id PK
    string name
    string region
    string prefecture
    string category
    text description
    text mythology
    text history
    text trivia
    decimal latitude
    decimal longitude
    string image_url
    string music_url
    string video_url
    integer rarity
    integer mystic_points
    boolean is_initially_unlocked
    json images
    timestamp created_at
    timestamp updated_at
  }

  collections {
    bigint id PK
    bigint user_id FK
    bigint spot_id FK
    timestamp unlocked_at
    timestamp created_at
    timestamp updated_at
  }

  user_spots {
    bigint id PK
    bigint user_id FK
    bigint spot_id FK
    boolean is_unlocked
    timestamp unlocked_at
    timestamp visited_at
    timestamp created_at
    timestamp updated_at
  }

  stamps {
    bigint id PK
    bigint spot_id FK
    string name
    text description
    string image_path
    integer rarity
    timestamp created_at
    timestamp updated_at
  }

  user_stamps {
    bigint id PK
    bigint user_id FK
    bigint stamp_id FK
    timestamp obtained_at
    timestamp created_at
    timestamp updated_at
  }

  quizzes {
    bigint id PK
    bigint spot_id FK
    text question
    string option_a
    string option_b
    string option_c
    string option_d
    string correct_option
    text explanation
    integer reward_points
    timestamp created_at
    timestamp updated_at
  }

  quiz_answers {
    bigint id PK
    bigint user_id FK
    bigint quiz_id FK
    string selected_option
    boolean is_correct
    timestamp answered_at
    timestamp created_at
    timestamp updated_at
  }

  achievements {
    bigint id PK
    string title
    text description
    string condition_type
    integer condition_value
    string icon_name
    integer reward_points
    timestamp created_at
    timestamp updated_at
  }

  user_achievements {
    bigint id PK
    bigint user_id FK
    bigint achievement_id FK
    timestamp earned_at
    timestamp created_at
    timestamp updated_at
  }
```

## リレーション概要

| 関係 | 内容 |
| --- | --- |
| users - collections | ユーザーが解放したスポット |
| spots - collections | スポットがどのユーザーに解放されたか |
| users - user_spots | ユーザーごとのスポット進行 |
| spots - user_spots | スポットごとの進行状態 |
| spots - stamps | スポットごとの御朱印 |
| users - user_stamps | ユーザーが獲得した御朱印 |
| stamps - user_stamps | 御朱印の獲得履歴 |
| spots - quizzes | スポットごとの神話クイズ |
| users - quiz_answers | ユーザーのクイズ回答履歴 |
| quizzes - quiz_answers | クイズごとの回答履歴 |
| users - user_achievements | ユーザーが獲得した称号 |
| achievements - user_achievements | 称号の獲得履歴 |

## ユニーク制約

| テーブル | 制約 |
| --- | --- |
| users | `email` をユニーク |
| collections | `user_id` + `spot_id` をユニーク |
| user_spots | `user_id` + `spot_id` をユニーク |
| stamps | `spot_id` をユニーク |
| user_stamps | `user_id` + `stamp_id` をユニーク |
| quiz_answers | `user_id` + `quiz_id` をユニーク |
| user_achievements | `user_id` + `achievement_id` をユニーク |

## 設計メモ

- `spots.image_url` / `music_url` / `video_url` はnullableにする。
- メディアファイルは保存せず、外部URLのみ参照する。
- `rarity` は1から5の整数で管理する。
- `mystic_points` は御朱印獲得に伴うスポット解放時の獲得ポイントとして使う。
- 御朱印は神話クイズで4問中3問以上正解した時に `user_stamps` へ保存する。
- 御朱印獲得時に `user_spots.is_unlocked` と `collections.unlocked_at` を更新する。
- 3問正解できなかった場合は、御朱印未獲得の間だけ `quiz_answers` を削除して再挑戦できる。
- MVPではお気に入り専用テーブルを作らず、コレクション解放を主軸にする。お気に入りが必要になった場合は `favorites` テーブルを追加する。
