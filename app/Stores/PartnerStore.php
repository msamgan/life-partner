<?php

namespace App\Stores;

use App\Models\Partner;
use Illuminate\Support\Collection;

class PartnerStore
{
    /**
     * Get partners for a specific user with consistent projection and ordering.
     */
    public function partners(int $userId): Collection
    {
        return Partner::query()
            ->where('user_id', $userId)
            ->latest()
            ->get(['id', 'name', 'description', 'created_at', 'updated_at']);
    }

    /**
     * Create a partner for the given user.
     */
    public function createPartner(int $userId, array $data): Partner
    {
        return Partner::query()->create([
            'user_id' => $userId,
            ...$data,
        ]);
    }

    /**
     * Update the given partner with validated data.
     */
    public function update(Partner $partner, array $data): bool
    {
        return $partner->update($data);
    }

    /**
     * Delete the given partner.
     */
    public function delete(Partner $partner): bool
    {
        return (bool) $partner->delete();
    }
}
