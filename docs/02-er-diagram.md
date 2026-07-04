# ER図

```mermaid
erDiagram
  users ||--o{ collections : unlocks
  users ||--o{ user_achievements : earns
  achievements ||--o{ user_achievements : granted_as
  spots ||--o{ collections : collected_as

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
| users - user_achievements | ユーザーが獲得した称号 |
| achievements - user_achievements | 称号の獲得履歴 |

## ユニーク制約

| テーブル | 制約 |
| --- | --- |
| users | `email` をユニーク |
| collections | `user_id` + `spot_id` をユニーク |
| user_achievements | `user_id` + `achievement_id` をユニーク |

## 設計メモ

- `spots.image_url` / `music_url` / `video_url` はnullableにする。
- メディアファイルは保存せず、外部URLのみ参照する。
- `rarity` は1から5の整数で管理する。
- `mystic_points` はスポット解放時の獲得ポイントとして使う。
- MVPではお気に入り専用テーブルを作らず、コレクション解放を主軸にする。お気に入りが必要になった場合は `favorites` テーブルを追加する。
