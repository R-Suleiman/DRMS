<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '10');
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_order', 'asc');
        $search = $request->input('search', '');

        $columnFilters = $request->all();
        unset($columnFilters['per_page'], $columnFilters['page'], $columnFilters['sort_by'], $columnFilters['sort_order'], $columnFilters['search']);

        $departmentsQuery = Department::query()
            ->where(function ($query) use ($search) {
                if (!empty($search)) {
                    $query->where('name', 'like', "%$search%")
                        ->orWhere('short_name', 'like', "%$search%");
                }
            });

        foreach ($columnFilters as $column => $value) {
            if ($value === '' || $value === null) {
                continue;
            }
            $departmentsQuery->where("$column", 'like', "%$value%");
        }

        $departments = $departmentsQuery
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'departments' => $departments
        ], 200);
    }

    public function getDepartments()
    {
        $departments = Department::select('id', 'name', 'short_name')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'departments' => $departments
        ], 200);
    }

    public function show($id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found!'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'department' => $department
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255|unique:departments,name',
            'short_name' => 'required|string|min:1|max:10|unique:departments,short_name',
        ]);

        $department = Department::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Department created successfully!',
            'department' => $department
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found!'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255|unique:departments,name,' . $id,
            'short_name' => 'required|string|min:1|max:10|unique:departments,short_name,' . $id,
        ]);

        $department->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully!',
            'department' => $department
        ], 200);
    }

    public function destroy($id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found!'
            ], 404);
        }

        // Check if department has any service records
        if ($department->records()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete department with existing records!'
            ], 409);
        }

        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Department deleted successfully!'
        ], 200);
    }
}
