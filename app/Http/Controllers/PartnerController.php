<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        Partner::create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return to_route('partners.index');
    }

    public function update(Request $request, Partner $partner): RedirectResponse
    {
        $this->authorizeAccess($request, $partner);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

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
