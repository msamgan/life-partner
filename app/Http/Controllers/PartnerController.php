<?php

namespace App\Http\Controllers;

use App\Http\Requests\Partner\StorePartnerRequest;
use App\Http\Requests\Partner\UpdatePartnerRequest;
use App\Models\Partner;
use App\Stores\PartnerStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    public function __construct(private readonly PartnerStore $store)
    {
        //
    }

    public function index(Request $request): Response
    {
        return Inertia::render('partners/index');
    }

    public function store(StorePartnerRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['name'] = Str::title($validated['name']);

        $this->store->createPartner($request->user()->id, $validated);

        return to_route('partners.index');
    }

    public function update(UpdatePartnerRequest $request, Partner $partner): RedirectResponse
    {
        $this->authorizeAccess($request, $partner);

        $validated = $request->validated();
        $validated['name'] = Str::title($validated['name']);
        $this->store->update($partner, $validated);

        return to_route('partners.index');
    }

    protected function authorizeAccess(Request $request, Partner $partner): void
    {
        abort_unless($partner->user_id === $request->user()->id, 403);
    }

    public function destroy(Request $request, Partner $partner): RedirectResponse
    {
        $this->authorizeAccess($request, $partner);

        $this->store->delete($partner);

        return to_route('partners.index');
    }

    public function list(Request $request): JsonResponse
    {
        $partners = $this->store->partners($request->user()->id);

        return response()->json([
            'data' => $partners,
        ]);
    }
}
