<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Partner\StorePartnerRequest;
use App\Http\Requests\Partner\UpdatePartnerRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class PartnerController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('partners/index');
    }

    public function store(StorePartnerRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Partner::query()->create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return to_route('partners.index');
    }

    public function update(UpdatePartnerRequest $request, Partner $partner): RedirectResponse
    {
        $this->authorizeAccess($request, $partner);

        $validated = $request->validated();

        $partner->update($validated);

        return to_route('partners.index');
    }

    public function destroy(Request $request, Partner $partner): RedirectResponse
    {
        $this->authorizeAccess($request, $partner);

        $partner->delete();

        return to_route('partners.index');
    }

    public function list(Request $request): JsonResponse
    {
        $partners = Partner::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get(['id', 'name', 'description', 'created_at', 'updated_at']);

        return response()->json([
            'data' => $partners,
        ]);
    }

    protected function authorizeAccess(Request $request, Partner $partner): void
    {
        abort_unless($partner->user_id === $request->user()->id, 403);
    }
}
