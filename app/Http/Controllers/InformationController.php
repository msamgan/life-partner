<?php

namespace App\Http\Controllers;

use App\Http\Requests\Information\StoreInformationRequest;
use App\Http\Requests\Information\UpdateInformationRequest;
use App\Models\Information;
use App\Stores\InformationStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InformationController extends Controller
{
    public function __construct(private readonly InformationStore $store)
    {
        //
    }

    public function index(Request $request): Response
    {
        return Inertia::render('information/index');
    }

    public function store(StoreInformationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $this->store->createInformation($request->user()->id, $validated);

        return to_route('information.index');
    }

    public function update(UpdateInformationRequest $request, Information $information): RedirectResponse
    {
        $this->authorizeAccess($request, $information);

        $validated = $request->validated();

        $this->store->update($information, $validated);

        return to_route('information.index');
    }

    protected function authorizeAccess(Request $request, Information $information): void
    {
        abort_unless($information->user_id === $request->user()->id, 403);
    }

    public function destroy(Request $request, Information $information): RedirectResponse
    {
        $this->authorizeAccess($request, $information);

        $this->store->delete($information);

        return to_route('information.index');
    }

    public function list(Request $request): JsonResponse
    {
        $items = $this->store->informations($request->user()->id);

        return response()->json([
            'data' => $items,
        ]);
    }
}
