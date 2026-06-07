<?php

namespace App\Http\Controllers;

use App\Models\DocumentCategory;
use Illuminate\Http\Request;

class DocumentCategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '10');
        $sortBy = $request->input('sort_by', 'category_name');
        $sortDirection = $request->input('sort_order', 'asc');
        $search = $request->input('search', '');

        $columnFilters = $request->all();
        unset($columnFilters['per_page'], $columnFilters['page'], $columnFilters['sort_by'], $columnFilters['sort_order'], $columnFilters['search']);

        $query = DocumentCategory::query()
            ->where(function ($q) use ($search) {
                if (!empty($search)) {
                    $q->where('category_name', 'like', "%$search%");
                }
            });

        foreach ($columnFilters as $column => $value) {
            if ($value === '' || $value === null) continue;
            $query->where($column, 'like', "%$value%");
        }

        $categories = $query->orderBy($sortBy, $sortDirection)->paginate($perPage);

        return response()->json(['success' => true, 'categories' => $categories], 200);
    }

    public function list()
    {
        $categories = DocumentCategory::orderBy('category_name', 'asc')->get(['id', 'category_name']);
        return response()->json(['success' => true, 'categories' => $categories], 200);
    }

    public function show($id)
    {
        $category = DocumentCategory::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Category not found'], 404);
        return response()->json(['success' => true, 'category' => $category], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|min:1|max:255|unique:document_categories,category_name',
        ]);

        $category = DocumentCategory::create($validated);

        return response()->json(['success' => true, 'message' => 'Category created', 'category' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = DocumentCategory::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Category not found'], 404);

        $validated = $request->validate([
            'category_name' => 'required|string|min:1|max:255|unique:document_categories,category_name,' . $id,
        ]);

        $category->update($validated);

        return response()->json(['success' => true, 'message' => 'Category updated', 'category' => $category], 200);
    }

    public function destroy($id)
    {
        $category = DocumentCategory::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Category not found'], 404);

        if ($category->documents()->exists() || $category->documentTypes()->exists()) {
            return response()->json(['success' => false, 'message' => 'Cannot delete category with existing documents or types'], 409);
        }

        $category->delete();
        return response()->json(['success' => true, 'message' => 'Category deleted'], 200);
    }
}
