<?php

namespace Tests\Unit;

use App\Models\Partner;
use App\Models\User;
use App\Stores\PartnerStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartnerStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_partners_lists_only_users_partners_in_desc_order(): void
    {
        $store = new PartnerStore();
        $user = User::factory()->create();
        $other = User::factory()->create();
        $p1 = Partner::factory()->for($user)->create(['created_at' => now()->subDay()]);
        $p2 = Partner::factory()->for($user)->create(['created_at' => now()]);
        Partner::factory()->for($other)->count(2)->create();

        $list = $store->partners($user->id);
        $this->assertCount(2, $list);
        $this->assertSame($p2->id, $list->first()->id); // latest first
    }

    public function test_createPartner_creates_with_user_id(): void
    {
        $store = new PartnerStore();
        $user = User::factory()->create();
        $partner = $store->createPartner($user->id, [
            'name' => 'Test',
            'description' => 'Desc',
        ]);

        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'user_id' => $user->id,
            'name' => 'Test',
            'description' => 'Desc',
        ]);
    }

    public function test_update_updates_fields(): void
    {
        $store = new PartnerStore();
        $partner = Partner::factory()->create(['name' => 'Old', 'description' => null]);
        $ok = $store->update($partner, ['name' => 'New', 'description' => 'X']);
        $this->assertTrue($ok);
        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'name' => 'New',
            'description' => 'X',
        ]);
    }

    public function test_delete_removes_row(): void
    {
        $store = new PartnerStore();
        $partner = Partner::factory()->create();
        $ok = $store->delete($partner);
        $this->assertTrue($ok);
        $this->assertDatabaseMissing('partners', ['id' => $partner->id]);
    }
}
