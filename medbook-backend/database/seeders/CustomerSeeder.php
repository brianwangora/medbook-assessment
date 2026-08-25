<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $scenarioDate = today();

        Customer::create([
            'name' => 'Peter',
            'service' => 'Consultation',
            'arrived_at' => $scenarioDate->copy()->setTime(9, 45),
            'original_priority' => 'Normal',
        ]);

        Customer::create([
            'name' => 'Mary',
            'service' => 'Consultation',
            'arrived_at' => $scenarioDate->copy()->setTime(11, 1),
            'original_priority' => 'Emergency',
        ]);

        Customer::create([
            'name' => 'John',
            'service' => 'Consultation',
            'arrived_at' => $scenarioDate->copy()->setTime(11, 4),
            'original_priority' => 'Emergency',
        ]);

        Customer::create([
            'name' => 'Susan',
            'service' => 'Consultation',
            'arrived_at' => $scenarioDate->copy()->setTime(10, 25),
            'original_priority' => 'Priority',
        ]);

        Customer::create([
            'name' => 'Daniel',
            'service' => 'Consultation',
            'arrived_at' => $scenarioDate->copy()->setTime(10, 50),
            'original_priority' => 'Normal',
        ]);
    }
}