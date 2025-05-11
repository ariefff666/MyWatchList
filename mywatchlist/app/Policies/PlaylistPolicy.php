<?php

namespace App\Policies;

use App\Models\Playlist;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PlaylistPolicy
{
    /**
     * Determine whether the user can view any models.
     * Biasanya tidak relevan untuk API yang hanya mengembalikan playlist milik user.
     */
    // public function viewAny(User $user): bool
    // {
    //     return true;
    // }

    /**
     * Determine whether the user can view the model.
     * User bisa melihat playlist jika dia adalah pemiliknya.
     */
    public function view(User $user, Playlist $playlist): bool
    {
        return $user->id === $playlist->user_id;
    }

    /**
     * Determine whether the user can create models.
     * Semua user yang terotentikasi bisa membuat playlist.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * User bisa mengupdate playlist jika dia adalah pemiliknya.
     */
    public function update(User $user, Playlist $playlist): bool
    {
        return $user->id === $playlist->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     * User bisa menghapus playlist jika dia adalah pemiliknya.
     */
    public function delete(User $user, Playlist $playlist): bool
    {
        return $user->id === $playlist->user_id;
    }

    /**
     * Determine whether the user can restore the model. (Jika menggunakan SoftDeletes)
     */
    // public function restore(User $user, Playlist $playlist): bool
    // {
    //     return $user->id === $playlist->user_id;
    // }

    /**
     * Determine whether the user can permanently delete the model. (Jika menggunakan SoftDeletes)
     */
    // public function forceDelete(User $user, Playlist $playlist): bool
    // {
    //     return $user->id === $playlist->user_id;
    // }
}