<?php

use App\Http\Controllers\InformationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/information', [InformationController::class, 'index'])->name('information.index');
    Route::get('/information/list', [InformationController::class, 'list'])->name('information.list');
    Route::post('/information', [InformationController::class, 'store'])->name('information.store');
    Route::patch('/information/{information}', [InformationController::class, 'update'])->name('information.update');
    Route::delete('/information/{information}', [InformationController::class, 'destroy'])->name('information.destroy');
});
