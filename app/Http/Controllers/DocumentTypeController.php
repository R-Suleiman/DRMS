<?php

namespace App\Http\Controllers;

use App\Models\DocumentType;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DocumentTypeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '10');
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_order', 'asc');
        $search = $request->input('search', '');

        $columnFilters = $request->all();
        unset($columnFilters['per_page'], $columnFilters['page'], $columnFilters['sort_by'], $columnFilters['sort_order'], $columnFilters['search']);

        $query = DocumentType::with('category')
            ->where(function ($q) use ($search) {
                if (!empty($search)) {
                    $q->where('name', 'like', "%$search%")
                      ->orWhereHas('category', function ($q2) use ($search) {
                          $q2->where('category_name', 'like', "%$search%");
                      });
                }
            });

        foreach ($columnFilters as $column => $value) {
            if ($value === '' || $value === null) continue;
            if ($column === 'category_name') {
                $query->whereHas('category', function ($q2) use ($value) {
                    $q2->where('category_name', 'like', "%$value%");
                });
            } else {
                $query->where("document_types.$column", 'like', "%$value%");
            }
        }

        $types = $query->orderBy($sortBy, $sortDirection)->paginate($perPage);

        return response()->json(['success' => true, 'types' => $types], 200);
    }

    public function list(Request $request)
    {
        $categoryId = $request->input('category_id');
        $query = DocumentType::query();
        if ($categoryId) $query->where('category_id', $categoryId);
        $types = $query->orderBy('name', 'asc')->get(['id', 'name', 'category_id']);
        return response()->json(['success' => true, 'types' => $types], 200);
    }

    public function show($id)
    {
        $type = DocumentType::with('category')->find($id);
        if (!$type) return response()->json(['success' => false, 'message' => 'Type not found'], 404);
        return response()->json(['success' => true, 'type' => $type], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', Rule::exists('document_categories', 'id')],
            'name' => [
                'required', 'string', 'min:1', 'max:255',
                Rule::unique('document_types')->where(function ($query) use ($request) {
                    return $query->where('category_id', $request->category_id);
                })
            ],
        ]);

        $type = DocumentType::create($validated);
        return response()->json(['success' => true, 'message' => 'Type created', 'type' => $type], 201);
    }

    public function update(Request $request, $id)
    {
        $type = DocumentType::find($id);
        if (!$type) return response()->json(['success' => false, 'message' => 'Type not found'], 404);

        $validated = $request->validate([
            'category_id' => ['required', 'integer', Rule::exists('document_categories', 'id')],
            'name' => [
                'required', 'string', 'min:1', 'max:255',
                Rule::unique('document_types')->where(function ($query) use ($request, $id) {
                    return $query->where('category_id', $request->category_id)->where('id', '!=', $id);
                })
            ],
        ]);

        $type->update($validated);
        return response()->json(['success' => true, 'message' => 'Type updated', 'type' => $type], 200);
    }

    public function destroy($id)
    {
        $type = DocumentType::find($id);
        if (!$type) return response()->json(['success' => false, 'message' => 'Type not found'], 404);

        if ($type->documents()->exists()) {
            return response()->json(['success' => false, 'message' => 'Cannot delete type with existing documents'], 409);
        }

        $type->delete();
        return response()->json(['success' => true, 'message' => 'Type deleted'], 200);
    }
}
