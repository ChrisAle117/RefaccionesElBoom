<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vacancy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminVacancyController extends Controller
{
    protected function sanitizeList($list)
    {
        if (!is_array($list)) return [];
        $result = [];
        foreach ($list as $item) {
            if (is_string($item)) {
                $txt = trim($item);
                if ($txt !== '') $result[] = $txt;
                continue;
            }
            if (is_array($item)) {
                $title = isset($item['title']) ? trim((string)$item['title']) : '';
                $items = [];
                if (isset($item['items']) && is_array($item['items'])) {
                    foreach ($item['items'] as $sub) {
                        if (is_string($sub)) {
                            $t = trim($sub);
                            if ($t !== '') $items[] = $t;
                        }
                    }
                }
                if ($title !== '' && !empty($items)) {
                    $result[] = ['title' => $title, 'items' => $items];
                } elseif ($title !== '' && empty($items)) {
                    $result[] = $title;
                }
            }
        }
        return $result;
    }
    public function index(Request $request)
    {
        $query = Vacancy::query();

        // Aplicar filtros
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', $search)
                ->orWhere('location', 'like', $search);
            });
        }

        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }

        // Obtener resultados
        $vacancies = $query->orderBy('created_at', 'desc')->get();

        // Obtener departamentos únicos para el filtro
        $departments = Vacancy::distinct('department')->pluck('department')->filter()->values();

        return Inertia::render('Admin/VacanciesAdmin', [
            'vacancies' => $vacancies,
            'filters' => $request->only(['search', 'department']),
            'departments' => $departments
        ]);
    }

    public function create()
    {
        // Obtener departamentos y ubicaciones existentes para los selectores
        $departments = Vacancy::distinct('department')->pluck('department')->filter()->values();
        $locations = Vacancy::distinct('location')->pluck('location')->filter()->values();

        return Inertia::render('Admin/VacancyForm', [
            'departments' => $departments,
            'locations' => $locations
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'required|array|min:1',
            'benefits' => 'required|array|min:1',
            'contact_email' => 'required|email',
            'active' => 'boolean'
        ]);

        // Sanitizar listas para asegurar formato consistente
        $validated['requirements'] = $this->sanitizeList($validated['requirements']);
        $validated['benefits'] = $this->sanitizeList($validated['benefits']);

        Vacancy::create($validated);

        return redirect()->route('admin.vacancies.index')
            ->with('success', 'Vacante creada correctamente.');
    }

    public function edit(Vacancy $vacancy)
    {
        // Obtener departamentos y ubicaciones existentes para los selectores
        $departments = Vacancy::distinct('department')->pluck('department')->filter()->values();
        $locations = Vacancy::distinct('location')->pluck('location')->filter()->values();

        return Inertia::render('Admin/VacancyForm', [
            'vacancy' => $vacancy,
            'departments' => $departments,
            'locations' => $locations
        ]);
    }

    public function update(Request $request, Vacancy $vacancy)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'required|array|min:1',
            'benefits' => 'required|array|min:1',
            'contact_email' => 'required|email',
            'active' => 'boolean'
        ]);

        $validated['requirements'] = $this->sanitizeList($validated['requirements']);
        $validated['benefits'] = $this->sanitizeList($validated['benefits']);

        $vacancy->update($validated);

        return redirect()->route('admin.vacancies.index')
            ->with('success', 'Vacante actualizada correctamente.');
    }

    public function destroy(Vacancy $vacancy)
    {
        try {
            $vacancy->delete();
            return redirect()->route('admin.vacancies.index')
                ->with('success', 'Vacante eliminada correctamente.');
        } catch (\Exception $e) {
            return redirect()->route('admin.vacancies.index')
                ->with('error', 'Error al eliminar la vacante: ' . $e->getMessage());
        }
    }

    public function toggleStatus(Request $request, Vacancy $vacancy)
    {
        try {
            $vacancy->active = $request->active;
            $vacancy->save();
            
            return redirect()->back()
                ->with('success', 'Estado de la vacante actualizado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Error al actualizar el estado de la vacante: ' . $e->getMessage());
        }
    }

    /**
     * Duplica una vacante con toda su información.
     */
    public function duplicate(Vacancy $vacancy)
    {
        try {
            $copy = $vacancy->replicate();
            // Diferenciar el título de la copia para evitar confusiones
            $copy->title = $vacancy->title . ' (Copia)';
            $copy->created_at = now();
            $copy->updated_at = now();
            $copy->save();

            return redirect()->route('admin.vacancies.index')
                ->with('success', 'Vacante duplicada correctamente.');
        } catch (\Exception $e) {
            return redirect()->route('admin.vacancies.index')
                ->with('error', 'Error al duplicar la vacante: ' . $e->getMessage());
        }
    }
}
