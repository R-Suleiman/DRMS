<?php

namespace App\Http\Controllers;

use App\Models\DocumentVolume;
use Illuminate\Http\Request;

class DocumentVolumeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '10');
        $sortBy = $request->input('sort_by', 'volume_name');
        $sortDirection = $request->input('sort_order', 'asc');
        $search = $request->input('search', '');

        $columnFilters = $request->all();
        unset($columnFilters['per_page'], $columnFilters['page'], $columnFilters['sort_by'], $columnFilters['sort_order'], $columnFilters['search']);

        $query = DocumentVolume::query()
            ->where(function ($q) use ($search) {
                if (!empty($search)) {
                    $q->where('volume_name', 'like', "%$search%");
                }
            });

        foreach ($columnFilters as $column => $value) {
            if ($value === '' || $value === null) continue;
            $query->where($column, 'like', "%$value%");
        }

        $volumes = $query->orderBy($sortBy, $sortDirection)->paginate($perPage);

        return response()->json(['success' => true, 'volumes' => $volumes], 200);
    }

    public function list()
    {
        $volumes = DocumentVolume::orderBy('volume_name', 'asc')->get(['id', 'volume_name']);
        return response()->json(['success' => true, 'volumes' => $volumes], 200);
    }

    public function show($id)
    {
        $volume = DocumentVolume::find($id);
        if (!$volume) return response()->json(['success' => false, 'message' => 'Volume not found'], 404);
        return response()->json(['success' => true, 'volume' => $volume], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'volume_name' => 'required|string|min:1|max:255|unique:document_volumes,volume_name',
        ]);

        $volume = DocumentVolume::create($validated);

        return response()->json(['success' => true, 'message' => 'Volume created', 'volume' => $volume], 201);
    }

    public function update(Request $request, $id)
    {
        $volume = DocumentVolume::find($id);
        if (!$volume) return response()->json(['success' => false, 'message' => 'Volume not found'], 404);

        $validated = $request->validate([
            'volume_name' => 'required|string|min:1|max:255|unique:document_volumes,volume_name,' . $id,
        ]);

        $volume->update($validated);

        return response()->json(['success' => true, 'message' => 'Volume updated', 'volume' => $volume], 200);
    }

    public function destroy($id)
    {
        $volume = DocumentVolume::find($id);
        if (!$volume) return response()->json(['success' => false, 'message' => 'Volume not found'], 404);

        if ($volume->documents()->exists()) {
            return response()->json(['success' => false, 'message' => 'Cannot delete volume with existing documents'], 409);
        }

        $volume->delete();
        return response()->json(['success' => true, 'message' => 'Volume deleted'], 200);
    }
}
