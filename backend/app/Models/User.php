<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// usersテーブルのModelです。
// Laravel標準のログインユーザーを表し、Sanctum APIトークンもここから発行します。
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        // 新規登録時に保存する基本情報です。passwordはcastsで自動ハッシュ化されます。
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        // APIレスポンスにパスワードやremember_tokenを出さないように隠します。
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            // Laravelのhashed castにより、保存時に平文パスワードをハッシュ化します。
            'password' => 'hashed',
        ];
    }

    public function collections(): HasMany
    {
        // このユーザーが解放したスポットの図鑑記録です。
        return $this->hasMany(Collection::class);
    }

    public function unlockedSpots(): BelongsToMany
    {
        // collectionsを経由して、解放済みSpotを直接取得するためのリレーションです。
        return $this->belongsToMany(Spot::class, 'collections')
            ->withPivot('unlocked_at')
            ->withTimestamps();
    }

    public function spotProgress(): HasMany
    {
        // user_spotsテーブルの進行状態です。解放済み・訪問済みなどを保存します。
        return $this->hasMany(UserSpot::class);
    }

    public function stamps(): BelongsToMany
    {
        // user_stampsを経由して、獲得済み御朱印を取得します。
        return $this->belongsToMany(Stamp::class, 'user_stamps')
            ->withPivot('obtained_at')
            ->withTimestamps();
    }

    public function quizAnswers(): HasMany
    {
        // ユーザーが回答したクイズ履歴です。再挑戦時はスポット単位で削除します。
        return $this->hasMany(QuizAnswer::class);
    }

    public function achievements(): BelongsToMany
    {
        // user_achievementsを経由して、獲得済み称号を取得します。
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('earned_at')
            ->withTimestamps();
    }
}
