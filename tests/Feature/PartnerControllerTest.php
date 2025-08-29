<?php

namespace Tests\Feature;

use App\Http\Requests\Partner\StorePartnerRequest;
use App\Http\Requests\Partner\UpdatePartnerRequest;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PartnerControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function actingAsNewUser(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    public function test_index_renders_inertia_page(): void
    {
        $this->actingAsNewUser();
        $response = $this->get('/partners');
        $response->assertStatus(200);
        // Inertia renders an HTML response containing the component name
        $response->assertSee('partners/index');
    }

    public function test_list_returns_authenticated_users_partners_only(): void
    {
        $user = $this->actingAsNewUser();
        $other = User::factory()->create();
        Partner::factory()->for($user)->count(2)->create();
        Partner::factory()->for($other)->count(3)->create();

        $res = $this->getJson('/partners/list');
        $res->assertOk()
            ->assertJsonStructure(['data'])
            ->assertJsonCount(2, 'data');

        // ensure each belongs to the authenticated user
        foreach ($res->json('data') as $p) {
            $this->assertDatabaseHas('partners', [
                'id' => $p['id'],
                'user_id' => $user->id,
            ]);
        }
    }

    public function test_store_validates_and_creates_partner(): void
    {
        $user = $this->actingAsNewUser();

        // invalid: missing name
        $this->post('/partners', [])->assertSessionHasErrors('name');

        // valid
        $payload = ['name' => 'Alice', 'description' => 'Friend'];
        $this->post('/partners', $payload)
            ->assertRedirect(route('partners.index'));

        $this->assertDatabaseHas('partners', [
            'user_id' => $user->id,
            'name' => 'Alice',
            'description' => 'Friend',
        ]);
    }

    public function test_update_validates_and_updates_when_owner(): void
    {
        $user = $this->actingAsNewUser();
        $partner = Partner::factory()->for($user)->create(['name' => 'Old', 'description' => null]);

        // invalid
        $this->patch("/partners/{$partner->id}", ['name' => ''])
            ->assertSessionHasErrors('name');

        // valid
        $this->patch("/partners/{$partner->id}", ['name' => 'New Name', 'description' => 'Desc'])
            ->assertRedirect(route('partners.index'));

        $this->assertDatabaseHas('partners', [
            'id' => $partner->id,
            'name' => 'New Name',
            'description' => 'Desc',
        ]);
    }

    public function test_update_forbidden_for_non_owner(): void
    {
        $this->actingAsNewUser();
        $other = User::factory()->create();
        $partner = Partner::factory()->for($other)->create();

        $this->patch("/partners/{$partner->id}", ['name' => 'X'])
            ->assertStatus(403);
    }

    public function test_destroy_deletes_when_owner_and_forbidden_when_not(): void
    {
        $user = $this->actingAsNewUser();
        $own = Partner::factory()->for($user)->create();
        $other = Partner::factory()->create();

        // delete own
        $this->delete("/partners/{$own->id}")
            ->assertRedirect(route('partners.index'));
        $this->assertDatabaseMissing('partners', ['id' => $own->id]);

        // cannot delete not owned
        $this->delete("/partners/{$other->id}")
            ->assertStatus(403);
    }
}
