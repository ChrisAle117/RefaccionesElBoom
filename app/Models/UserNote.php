<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNote extends Model
{
    protected $fillable = ['user_id', 'admin_id', 'content'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
