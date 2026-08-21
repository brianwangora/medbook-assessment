<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'name', 
        'service', 
        'arrived_at', 
        'original_priority', 
        'status'
    ];

    protected $casts = [
        'arrived_at' => 'datetime',
    ];
}
