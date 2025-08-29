<?php

namespace Database\Factories;

use App\Models\Information;
use Illuminate\Database\Eloquent\Factories\Factory;

class InformationFactory extends Factory
{
    protected $model = Information::class;

    public function definition(): array
    {
        return [
            'user_id' => $this->faker->randomNumber(),
            'content' => $this->faker->word(),
        ];
    }
}
