<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Record;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalRecords = Record::all()->count();
        $totalDocuments = Document::all()->count();
        $users = User::all()->count();

        $stats = [
            'totalRecords' => $totalRecords,
            'totalDocuments' => $totalDocuments,
            'users' => $users
        ];

        return response()->json(['success' => true, 'stats' => $stats]);
    }
}
