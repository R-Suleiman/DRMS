<?php

namespace App\Http\Controllers;

use App\Models\AllRecords;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\DocumentType;
use App\Models\DocumentVolume;
use App\Models\Record;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalPersonalRecords = AllRecords::where('record_type', 'personal')->count();
        $totalServiceRecords = AllRecords::where('record_type', 'service')->count();
        $totalDocuments = Document::count();
        $users = User::count();
        $categories = DocumentCategory::count();
        $types = DocumentType::count();
        $volumes = DocumentVolume::count();

        $recordsByMonth = Record::selectRaw("DATE_FORMAT(created_at, '%b %Y') as label, COUNT(*) as total")
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('label')
            ->orderByRaw("MIN(created_at)")
            ->get();

        $documentsByCategory = Document::select('document_categories.category_name', DB::raw('COUNT(documents.id) as total'))
            ->join('document_categories', 'documents.category', '=', 'document_categories.id')
            ->groupBy('document_categories.category_name')
            ->orderByDesc('total')
            ->limit(6)
            ->get();

        $documentsByVolume = Document::select('document_volumes.volume_name', DB::raw('COUNT(documents.id) as total'))
            ->join('document_volumes', 'documents.volume_id', '=', 'document_volumes.id')
            ->groupBy('document_volumes.volume_name')
            ->orderByDesc('total')
            ->limit(6)
            ->get();

        $usersByRole = DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->select('roles.name', DB::raw('COUNT(model_has_roles.model_id) as total'))
            ->where('model_has_roles.model_type', User::class)
            ->groupBy('roles.name')
            ->orderByDesc('total')
            ->get();

        $stats = [
            'totalPersonalRecords' => $totalPersonalRecords,
            'totalServiceRecords' => $totalServiceRecords,
            'totalDocuments' => $totalDocuments,
            'users' => $users,
            'categories' => $categories,
            'types' => $types,
            'volumes' => $volumes,
            'recordsByMonth' => $recordsByMonth,
            'documentsByCategory' => $documentsByCategory,
            'documentsByVolume' => $documentsByVolume,
            'usersByRole' => $usersByRole,
        ];

        return response()->json(['success' => true, 'stats' => $stats]);
    }
}
