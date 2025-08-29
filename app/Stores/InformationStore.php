<?php

namespace App\Stores;

use App\Models\Information;
use Illuminate\Support\Collection;

class InformationStore
{
    /**
     * Get information entries for a specific user with consistent projection and ordering.
     */
    public function informations(int $userId): Collection
    {
        return Information::query()
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'content', 'created_at', 'updated_at']);
    }

    /**
     * Create an information entry for the given user.
     */
    public function createInformation(int $userId, array $data): Information
    {
        return Information::query()->create([
            'user_id' => $userId,
            ...$data,
        ]);
    }

    /**
     * Update the given information entry with validated data.
     */
    public function update(Information $information, array $data): bool
    {
        return $information->update($data);
    }

    /**
     * Delete the given information entry.
     */
    public function delete(Information $information): bool
    {
        return (bool) $information->delete();
    }
}
