<?php

namespace App\Http\Controllers;

use App\Models\AllRecords;
use App\Models\Department;
use App\Models\RecordMetadata;
use App\Models\ServiceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ServiceRecordsController extends Controller
{
    public function records(Request $request)
    {
        $perPage = $request->input('per_page', '');
        $sortBy = $request->input('sort_by', '');
        $sortDirection = $request->input('sort_order', 'asc');
        $search = $request->input('search', '');

        $columnFilters = $request->all();
        unset($columnFilters['per_page'], $columnFilters['page'], $columnFilters['sort_by'], $columnFilters['sort_order'], $columnFilters['search']);

        $RecordsQuery = AllRecords::with('serviceRecords.department');

        if (!optional(Auth::user())->can('manage_classified_records')) {
            $RecordsQuery->whereHas('serviceRecords', function ($query) {
                $query->where('is_classified', false);
            });
        }

        $RecordsQuery
            ->where(function ($query) use ($search) {
                if (!empty($search)) {
                    $query->where('record_number', 'like', "%$search%")
                        ->orWhereHas('serviceRecords', function ($query) use ($search) {
                            $query->where('service_name', 'like', "%$search%")
                                ->orWhere('description', 'like', "%$search%")
                                ->orWhereHas('department', function ($query) use ($search) {
                                    $query->where('name', 'like', "%$search%");
                                });
                        });
                }
            });

        foreach ($columnFilters as $column => $value) {
            if ($value === '' || $value === null) {
                continue;
            }
            if ($column === 'department') {
                $RecordsQuery->whereHas('serviceRecords.department', function ($query) use ($value) {
                    $query->where('name', 'like', "%$value%");
                });
                continue;
            }
            if ($column === 'record_number') {
                $RecordsQuery->where('record_number', 'like', "%$value%");
                continue;
            }
            $RecordsQuery->whereHas('serviceRecords', function ($query) use ($column, $value) {
                $query->where("service_records.$column", 'like', "%$value%");
            });
        }

        $records = $RecordsQuery->orderBy($sortBy, $sortDirection)->paginate($perPage);

        return response()->json(['success' => true, 'records' => $records], 200);
    }

    public function record($id)
    {
        $record = AllRecords::with('serviceRecords.department', 'metadata', 'documents.category', 'documents.type', 'documents.volume')->where('id', $id)->first();

        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Record not found!'], 404);
        }

        return response()->json(['success' => true, 'record' => $record], 200);
    }

    public function getDepartments()
    {
        $departments = Department::all();
        return response()->json(['success' => true, 'departments' => $departments], 200);
    }

    public function create(Request $request)
    {
        $request->validate([
            'service_name' => 'required',
            'description' => 'nullable',
            'department_id' => 'required|exists:departments,id',
            'is_classified' => 'boolean',
            'metadata' => 'nullable|json',
        ]);

        $allRecord = DB::transaction(function () use ($request) {
            $allRecord = AllRecords::create([
                'record_number' => $this->generateServiceRecordNumber(),
                'record_type' => 'service'
            ]);

            $record = new ServiceRecord();
            $record->record_id = $allRecord->id;
            $record->service_name = $request->input('service_name');
            $record->description = $request->input('description');
            $record->department_id = $request->input('department_id');
            $record->is_classified = $request->input('is_classified', false);
            $record->save();

            if (!empty($request->input('metadata'))) {
                $metadata = json_decode($request->input('metadata'), true);

                foreach ($metadata as $key => $value) {
                    RecordMetadata::create([
                        'record_id' => $allRecord->id,
                        'meta_key'  => $key,
                        'meta_value' => is_array($value) ? json_encode($value) : $value,
                    ]);
                }
            }

            return $allRecord;
        });

        return response()->json(['success' => true, 'message' => 'Service record created successfully!', 'recordId' => $allRecord->id], 201);
    }

    public function updateRecord(Request $request, $id)
    {
        $record = ServiceRecord::where('record_id', $id)->first();

        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Record not found!'], 404);
        }

        $request->validate([
            'service_name' => 'required',
            'description' => 'nullable',
            'department_id' => 'required|exists:departments,id',
            'is_classified' => 'boolean',
            'metadata' => 'nullable|json',
        ]);

        $record->service_name = $request->input('service_name');
        $record->description = $request->input('description');
        $record->department_id = $request->input('department_id');
        $record->is_classified = $request->input('is_classified', false);
        $record->save();

        // update metadata
        if (!empty($request->input('metadata'))) {
            $metadata = json_decode($request->input('metadata'), true);

            foreach ($metadata as $key => $value) {
                RecordMetadata::updateOrCreate(
                    ['record_id' => $id, 'meta_key' => $key],
                    ['meta_value' => is_array($value) ? json_encode($value) : $value]
                );
            }
        }

        return response()->json(['success' => true, 'message' => 'Service record updated successfully!', 'recordId' => $id], 200);
    }

    public function deleteRecord($id)
    {
        $allRecord = AllRecords::findOrFail($id);
        $allRecord->delete();

        return response()->json(['success' => true, 'message' => 'Record deleted successfully']);
    }
}
