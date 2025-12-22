<?php
// app/Http/Controllers/Api/VacancyController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vacancy;
use Illuminate\Http\Request;

class VacancyController extends Controller
{
    public function index()
    {
        // Obtener solo las vacantes activas para el frontend público
        $vacancies = Vacancy::where('active', true)->get();
        
        return response()->json($vacancies);
    }
    
    public function show($id)
    {
        $vacancy = Vacancy::findOrFail($id);
        
        return response()->json($vacancy);
    }
}