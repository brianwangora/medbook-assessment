<?php

use App\Http\Controllers\CustomerController;

Route::post('/customers', [CustomerController::class, 'store']);
Route::get('/customers/queue', [CustomerController::class, 'queue']);
Route::get('/customers/next', [CustomerController::class, 'next']);
Route::patch('/customers/{customer}/status', [CustomerController::class, 'updateStatus']);
Route::get('/customers/serving', [CustomerController::class, 'serving']);