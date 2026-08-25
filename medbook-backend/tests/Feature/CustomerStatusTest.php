<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CustomerStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_completed_customer_cannot_transition_to_waiting(): void
    {
        $customer = Customer::create([
            'name' => 'Test',
            'service' => 'Consultation',
            'arrived_at' => now()->subMinutes(30),
            'original_priority' => 'Normal',
            'status' => 'Completed',
        ]);

        $response = $this->patchJson("/api/customers/{$customer->id}/status", [
            'status' => 'Waiting',
        ]);

        $response->assertStatus(422);
        $this->assertEquals('Completed', $customer->fresh()->status);
    }

    public function test_cannot_serve_two_customers_at_once(): void
    {
        $alreadyServing = Customer::create([
            'name' => 'First',
            'service' => 'Consultation',
            'arrived_at' => now()->subMinutes(30),
            'original_priority' => 'Normal',
            'status' => 'Being Served',
        ]);

        $waiting = Customer::create([
            'name' => 'Second',
            'service' => 'Consultation',
            'arrived_at' => now()->subMinutes(10),
            'original_priority' => 'Normal',
            'status' => 'Waiting',
        ]);

        $response = $this->patchJson("/api/customers/{$waiting->id}/status", [
            'status' => 'Being Served',
        ]);

        $response->assertStatus(409);
        $this->assertEquals('Waiting', $waiting->fresh()->status);
    }
}
