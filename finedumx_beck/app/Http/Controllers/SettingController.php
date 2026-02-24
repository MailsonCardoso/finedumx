<?php

namespace App\Http\Controllers;

use App\Models\SchoolSetting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = SchoolSetting::first();
        if (!$settings) {
            $settings = SchoolSetting::create([
                'name' => 'Colégio FinEdu',
                'cnpj' => '12.345.678/0001-90',
                'phone' => '(11) 3456-7890',
                'email' => 'contato@finedu.edu.br',
                'address' => 'Rua da Educação, 123 - São Paulo, SP',
            ]);
        }
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = SchoolSetting::first();
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'cnpj' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'pix_key' => 'nullable|string',
            'theme' => 'nullable|string',
        ]);

        $settings->update($validated);
        return response()->json($settings);
    }
}
