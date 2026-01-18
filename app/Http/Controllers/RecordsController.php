<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\DocumentType;
use App\Models\Record;
use App\Models\RecordMetadata;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RecordsController extends Controller
{
    public function records(Request $request)
    {
        $perPage = $request->input('per_page', '');
        $sortBy = $request->input('sort_by', '');
        $sortDirection = $request->input('sort_order', 'asc');
        $search = $request->input('search', '');

        $columnFilters = $request->all();
        unset($columnFilters['per_page'], $columnFilters['page'], $columnFilters['sort_by'], $columnFilters['sort_order'], $columnFilters['search']);

        $RecordsQuery = Record::query()->with('metadata')
            ->where(function ($query) use ($search) {
                if (!empty($search)) {
                    $query->where('first_name', 'like', "%$search%")
                        ->orWhere('middle_name', 'like', "%$search%")
                        ->orWhere('last_name', 'like', "%$search%")
                        ->orWhere('phone', 'like', "%$search%")
                        ->orWhere('gender', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%")
                        ->orWhereHas('metadata', function ($q) use ($search) {
                            $q->where('nida', 'like', "%$search%");
                        });
                }
            });

        foreach ($columnFilters as $column => $value) {
            if ($column === 'nida') {
                $RecordsQuery->whereHas('metadata', function ($q) use ($value) {
                    $q->where('nida', 'like', "%$value%");
                });
            } else {
                $RecordsQuery->where("records.$column", 'like', "%$value%");
            }
        }

        $records = $RecordsQuery->orderBy($sortBy, $sortDirection)->paginate($perPage);

        return response()->json(['success' => true, 'records' => $records], 200);
    }

    public function record($id)
    {
        $record = Record::with('metadata', 'documents.category', 'documents.type')->where('id', $id)->first();

        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Record not found!'], 404);
        }

        return response()->json(['success' => true, 'record' => $record], 200);
    }

    public function createRecord(Request $request)
    {
        $validated = $request->validate([
            'first_name'  => 'required|string|min:3',
            'middle_name' => 'nullable|string|min:3',
            'last_name'   => 'required|string|min:3',
            'gender'      => 'required|in:M,F',
            'dob'         => 'required|date',
            // 0XXXXXXXXX (TZ format)
            'phone' => [
                'required',
                'regex:/^0\d{9}$/',
                'unique:records,phone',
            ],
            'email' => 'nullable|email|unique:records,email',
            // NIDA format
            'nida' => [
                'nullable',
                'regex:/^\d{8}-\d{5}-\d{5}-\d{2}$/',
                'unique:records,nida',
            ],
            'photo'    => 'nullable|file|mimes:png,jpg,avif,webp|max:5120',
            'metadata' => 'nullable|json',
        ]);

        $record = Record::create([
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name'   => $validated['last_name'],
            'gender'      => $validated['gender'],
            'dob'         => $validated['dob'],
            'phone'       => $validated['phone'],
            'email'       => $validated['email'] ?? null,
            'nida'        => $validated['nida'] ?? null,
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $uuid = Str::uuid();

            $path = $file->storeAs(
                "documents/persons/{$record->id}/profile_photo",
                "{$uuid}." . $file->getClientOriginalExtension(),
                'private'
            );

            $record->update([
                'photo' => $path,
            ]);
        }

        // Insert metadata
        if (!empty($validated['metadata'])) {
            $metadata = json_decode($validated['metadata'], true);

            foreach ($metadata as $key => $value) {
                RecordMetadata::create([
                    'record_id' => $record->id,
                    'meta_key'  => $key,
                    'meta_value' => is_array($value) ? json_encode($value) : $value,
                ]);
            }
        }

        return response()->json([
            'success'  => true,
            'recordId' => $record->id,
            'message' => 'Record Profile created successfully'
        ], 201);
    }

    public function updateRecord(Request $request, $id)
    {
        $validated = $request->validate(
            [
                'first_name'  => 'required|string|min:3',
                'middle_name' => 'nullable|string|min:3',
                'last_name'   => 'required|string|min:3',
                'gender'      => 'required|in:M,F',
                'dob'         => 'required|date',
                'phone' => [
                    'required',
                    'regex:/^0\d{9}$/',
                ],
                'email' => 'nullable|email',
                'nida' => [
                    'nullable',
                    'regex:/^\d{8}-\d{5}-\d{5}-\d{2}$/',
                ],
                'photo'    => 'nullable|file|mimes:png,jpg,avif,webp|max:5120',
                'metadata' => 'nullable|json',
            ],
            [
                'first_name.required' => 'First name is required.',
                'first_name.min'      => 'First name must be at least 3 characters.',

                'last_name.required' => 'Last name is required.',
                'last_name.min'      => 'Last name must be at least 3 characters.',

                'gender.required' => 'Please select a gender.',
                'gender.in'       => 'Gender must be either M or F.',

                'dob.required' => 'Date of birth is required.',
                'dob.date'     => 'Date of birth must be a valid date.',

                'phone.required' => 'Phone number is required.',
                'phone.regex'    => 'Phone number must start with 0 and contain exactly 10 digits.',

                'email.email'  => 'Please enter a valid email address.',

                'nida.regex'  => 'NIDA number must follow the format XXXXXXXX-XXXXX-XXXXX-XX.',

                'photo.mimes' => 'Photo must be a PNG, JPG, AVIF, or WEBP file.',
                'photo.max'   => 'Photo size must not exceed 5MB.',

                'metadata.json' => 'Metadata must be valid JSON.',
            ]
        );

        $existingRecord = Record::where('id', $id)->first();

        $existingRecord->update([
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name'   => $validated['last_name'],
            'gender'      => $validated['gender'],
            'dob'         => $validated['dob'],
            'phone'       => $validated['phone'],
            'email'       => $validated['email'] ?? null,
            'nida'        => $validated['nida'] ?? null,
        ]);

        $path = $existingRecord->photo;
        if ($request->hasFile('photo')) {
            // delete the existing photo fron storage
            Storage::delete($path);

            // create new
            $file = $request->file('photo');
            $uuid = Str::uuid();

            $path = $file->storeAs(
                "documents/persons/{$existingRecord->id}/profile_photo",
                "{$uuid}." . $file->getClientOriginalExtension(),
                'private'
            );
        }

        $existingRecord->update([
            'photo' => $path,
        ]);

        if (!empty($validated['metadata'])) {
            $metadata = json_decode($validated['metadata'], true);

            foreach ($metadata as $key => $value) {
                RecordMetadata::updateOrCreate(
                    [
                        'record_id' => $existingRecord->id,
                        'meta_key'  => $key,
                    ],
                    ['meta_value' => is_array($value) ? json_encode($value) : $value,]
                );
            }
        }

        return response()->json([
            'success'  => true,
            'message' => 'Record Profile updated successfully',
            'recordId' => $existingRecord->id,
        ], 201);
    }

    public function getRecordPhoto($recordId)
    {
        $record = Record::findOrFail($recordId);
        $fullPath = Storage::disk('private')->path($record->photo);
        $mime = Storage::mimeType($record->photo);

        // Clean any previous output to prevent corruption
        if (ob_get_contents()) ob_end_clean();

        $headers = [
            'Content-Type'        => $mime,
            'Content-Length'      => Storage::disk('private')->size($record->photo),
            'Accept-Ranges'       => 'bytes',
        ];

        $disposition = 'inline';
        $headers['Content-Disposition'] = $disposition;

        return response()->file($fullPath, $headers);
    }

    public function createRecordDocument(Request $request, $id)
    {
        $request->validate([
            'category' => 'required|string',
            'type' => 'required|string',
            'file' => 'required|file|max:10240', // 10MB
        ]);

        $person = Record::findOrFail($id);
        $file = $request->file('file');
        $uuid = Str::uuid();
        $categoryName = DocumentCategory::where('id', $request->category)->first()->category_name;

        $path = $file->storeAs(
            "documents/persons/{$person->id}/{$categoryName}",
            "{$uuid}." . $file->getClientOriginalExtension()
        );

        $document = Document::create([
            'record_id' => $person->id,
            'category' => $request->category,
            'name' => $request->type,
            'file_path' => $path,
            'size' => $file->getSize(),
            'mime_type' => $file->getClientOriginalExtension(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully',
            'document' => $document
        ], 201);
    }

    public function viewDocument($documentId)
    {
        $document = Document::findOrFail($documentId);
        $path = $document->file_path;

        if (!Storage::disk('private')->exists($path)) {
            abort(404);
        }

        $fullPath = Storage::disk('private')->path($path);  // gets absolute path like storage/app/private/...

        $mime = Storage::mimeType($path);  // or fallback: mime_content_type($fullPath)

        // Clean any previous output to prevent corruption
        if (ob_get_contents()) ob_end_clean();

        $headers = [
            'Content-Type'        => $mime,
            'Content-Length'      => Storage::disk('private')->size($path),
            'Accept-Ranges'       => 'bytes',
        ];

        $displayName = 'document';

        $disposition = str_starts_with($mime, 'image/') || $mime === 'application/pdf'
            ? 'inline'
            : 'attachment';

        $headers['Content-Disposition'] = $disposition . '; filename="' . $displayName . '"';

        return response()->file($fullPath, $headers);

        // $path = $document->file_path;

        // if (!Storage::disk('private')->exists($path)) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'File missing from storage',
        //         'checked_path' => $path,           // for debugging
        //         'full_path' => storage_path("app/private/{$path}"),
        //     ], 404);
        // }

        // $url = Storage::disk('private')->temporaryUrl($path, now()->addHours(10));

        // return response()->json([
        //     'success' => true,
        //     'fileUrl' => $url
        // ]);
    }

    public function deleteDocument($documentId)
    {
        $document = Document::where('id', $documentId)->first();

        if (!$document) {
            return response()->json(['success' => false, 'message' => 'Document not found!'], 404);
        }

        Storage::delete($document->file_path);
        $document->delete();

        return response()->json(['success' => true, 'message' => 'Document deleted successfully!'], 200);
    }

    public function getRecordCategories()
    {
        $categories = DocumentCategory::all();

        if (!$categories) {
            return response()->json(['success' => false, 'message' => 'No Categories found'], 404);
        }

        return response()->json(['success' => true, 'categories' => $categories], 200);
    }

    public function getRecordTypes($id)
    {
        $types = DocumentType::where('category_id', $id)->get();

        if (!$types) {
            return response()->json(['success' => false, 'message' => 'No Documents Types found'], 404);
        }

        return response()->json(['success' => true, 'types' => $types], 200);
    }
}
