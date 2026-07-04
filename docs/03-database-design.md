# DB設計・テーブル定義

## users

Laravel標準のユーザーテーブルを利用します。

| カラム | 型 | Null | 説明 |
| --- | --- | --- | --- |
| id | bigserial | no | 主キー |
| name | varchar(255) | no | ユーザー名 |
| email | varchar(255) | no | メールアドレス |
| email_verified_at | timestamp | yes | メール認証日時 |
| password | varchar(255) | no | ハッシュ化済みパスワード |
| remember_token | varchar(100) | yes | Remember token |
| created_at | timestamp | yes | 作成日時 |
| updated_at | timestamp | yes | 更新日時 |

## spots

神秘スポットの基本情報、神話、歴史、外部メディアURLを保持します。

| カラム | 型 | Null | 説明 |
| --- | --- | --- | --- |
| id | bigserial | no | 主キー |
| name | varchar(255) | no | スポット名 |
| region | varchar(255) | no | エリア名 |
| prefecture | varchar(255) | no | 都道府県 |
| category | varchar(100) | no | カテゴリ |
| description | text | no | 概要説明 |
| mythology | text | no | 神話・伝説 |
| history | text | no | 歴史 |
| trivia | text | no | 豆知識 |
| latitude | decimal(10,7) | no | 緯度 |
| longitude | decimal(10,7) | no | 経度 |
| image_url | varchar(2048) | yes | 画像URL |
| music_url | varchar(2048) | yes | 音楽URL |
| video_url | varchar(2048) | yes | 動画URL |
| rarity | smallint | no | レア度 1-5 |
| mystic_points | integer | no | 解放時の神秘ポイント |
| created_at | timestamp | yes | 作成日時 |
| updated_at | timestamp | yes | 更新日時 |

### category 候補

| 値 | 表示名 |
| --- | --- |
| shrine_temple | 神社・仏閣 |
| nature | 自然 |
| sea_lake | 海・湖 |
| myth | 神話 |
| forest_mountain | 山・森 |
| other | その他 |

## collections

ユーザーが解放したスポットを管理します。

| カラム | 型 | Null | 説明 |
| --- | --- | --- | --- |
| id | bigserial | no | 主キー |
| user_id | bigint | no | users.id |
| spot_id | bigint | no | spots.id |
| unlocked_at | timestamp | no | 解放日時 |
| created_at | timestamp | yes | 作成日時 |
| updated_at | timestamp | yes | 更新日時 |

### インデックス

| 種別 | カラム |
| --- | --- |
| unique | user_id, spot_id |
| index | user_id |
| index | spot_id |

## achievements

称号のマスターデータです。

| カラム | 型 | Null | 説明 |
| --- | --- | --- | --- |
| id | bigserial | no | 主キー |
| title | varchar(255) | no | 称号名 |
| description | text | no | 達成条件の説明 |
| condition_type | varchar(100) | no | 条件種別 |
| condition_value | integer | no | 条件値 |
| condition_category | varchar(100) | yes | カテゴリ条件の対象 |
| icon_name | varchar(100) | no | lucide-reactのアイコン名 |
| reward_points | integer | no | 追加報酬ポイント |
| created_at | timestamp | yes | 作成日時 |
| updated_at | timestamp | yes | 更新日時 |

### condition_type 候補

| 値 | 意味 |
| --- | --- |
| unlock_count | 解放スポット数 |
| category_unlock_count | 特定カテゴリの解放数 |
| completion_rate | 図鑑達成率 |
| mystic_points_total | 神秘ポイント合計 |

## user_achievements

ユーザーが獲得した称号を管理します。

| カラム | 型 | Null | 説明 |
| --- | --- | --- | --- |
| id | bigserial | no | 主キー |
| user_id | bigint | no | users.id |
| achievement_id | bigint | no | achievements.id |
| earned_at | timestamp | no | 獲得日時 |
| created_at | timestamp | yes | 作成日時 |
| updated_at | timestamp | yes | 更新日時 |

### インデックス

| 種別 | カラム |
| --- | --- |
| unique | user_id, achievement_id |
| index | user_id |
| index | achievement_id |

## MVP Seeder スポット

| エリア | スポット | 都道府県 | カテゴリ | レア度 | 神秘ポイント |
| --- | --- | --- | --- | --- | --- |
| 北の神秘 | 青い池 | 北海道 | sea_lake | 4 | 100 |
| 北の神秘 | 神の子池 | 北海道 | sea_lake | 4 | 100 |
| 神々の山と森 | 白神山地 | 青森県・秋田県 | forest_mountain | 5 | 150 |
| 神々の山と森 | 戸隠神社 | 長野県 | shrine_temple | 5 | 150 |
| 神話の都 | 伏見稲荷大社 | 京都府 | shrine_temple | 5 | 150 |
| 神話の都 | 貴船神社 | 京都府 | shrine_temple | 4 | 120 |
| 神々が降り立った地 | 熊野古道 | 和歌山県 | myth | 5 | 150 |
| 神々が降り立った地 | 那智の滝 | 和歌山県 | nature | 5 | 150 |
| 国生み神話 | 出雲大社 | 島根県 | shrine_temple | 5 | 150 |
| 国生み神話 | 稲佐の浜 | 島根県 | myth | 4 | 120 |
| 天孫降臨 | 高千穂峡 | 宮崎県 | myth | 5 | 150 |
| 天孫降臨 | 天岩戸神社 | 宮崎県 | shrine_temple | 5 | 150 |
| 神々の島 | 屋久島 | 鹿児島県 | forest_mountain | 5 | 150 |
| 神々の島 | 古宇利島 | 沖縄県 | sea_lake | 4 | 120 |

実装時のSeederでは、各スポットに説明・神話・歴史・豆知識・緯度・経度・ダミーURLを登録します。
