<?php

namespace App\Http\Controllers;

use App\Models\AllRecords;

abstract class Controller
{
    // Global method to check and generate record number
    protected function generatePersonalRecordNumber()
    {
        $currentYearShort = date('y'); // two-digit year
        $pattern = "REC/PER/{$currentYearShort}/%";

        $latestRecord = AllRecords::where('record_number', 'like', $pattern)
            ->orderBy('record_number', 'desc')
            ->lockForUpdate()
            ->first();

        if ($latestRecord) {
            $latestNumber = $latestRecord->record_number;
            $lastSequence = (int) substr($latestNumber, -4);
            $newSequence = str_pad($lastSequence + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newSequence = '0001';
        }

        return 'REC/PER/' . $currentYearShort . '/' . $newSequence;
    }

    protected function generateServiceRecordNumber()
    {
        $currentYearShort = date('y'); // two-digit year
        $pattern = "REC/SER/{$currentYearShort}/%";

        $latestRecord = AllRecords::where('record_number', 'like', $pattern)
            ->orderBy('record_number', 'desc')
            ->lockForUpdate()
            ->first();

        if ($latestRecord) {
            $latestNumber = $latestRecord->record_number;
            $lastSequence = (int) substr($latestNumber, -4);
            $newSequence = str_pad($lastSequence + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newSequence = '0001';
        }

        return 'REC/SER/' . $currentYearShort . '/' . $newSequence;
    }
}
