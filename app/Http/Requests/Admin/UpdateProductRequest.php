<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $productId = $this->route('id');
        
        return [
            'name'           => 'required|string|max:255',
            'code'           => 'required|string|max:100|unique:products,code,' . $productId . ',id_product',
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0',
            'disponibility'  => 'required|integer|min:0',
            'reserved_stock' => 'required|integer|min:0',
            'type'           => 'required|string|max:100',
            'image'          => 'nullable|url|max:255',
            'weight'         => 'nullable|numeric|min:0',
            'length'         => 'nullable|numeric|min:0',
            'width'          => 'nullable|numeric|min:0',
            'height'         => 'nullable|numeric|min:0',
            'audio'          => 'sometimes|file|mimes:mp3,ogg,wav|max:10240',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del producto es obligatorio.',
            'code.required' => 'El código del producto es obligatorio.',
            'code.unique' => 'Ya existe un producto con este código.',
            'price.required' => 'El precio es obligatorio.',
            'price.min' => 'El precio no puede ser negativo.',
            'disponibility.required' => 'La disponibilidad es obligatoria.',
            'type.required' => 'El tipo de producto es obligatorio.',
            'audio.mimes' => 'El archivo de audio debe ser en formato MP3, OGG o WAV.',
            'audio.max' => 'El archivo de audio no puede exceder 10MB.',
        ];
    }
}
