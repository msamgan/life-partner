<?php

namespace App\Http\Requests\Information;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInformationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => ['required', 'string'],
                        'partner_id' => [
                            'required',
                            'integer',
                            \Illuminate\Validation\Rule::exists('partners', 'id')->where(fn ($q) => $q->where('user_id', $this->user()->id)),
                        ],
        ];
    }
}
