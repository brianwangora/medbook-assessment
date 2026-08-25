<?php

namespace Tests\Unit;

use App\Models\Customer;
use App\Services\QueueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QueueServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_normal_priority_escalates_to_priority_at_exactly_60_minutes(): void
    {
        $arrivedAt = now()->subMinutes(60);
        $customer = Customer::create([
            'name' => 'Test',
            'service' => 'Consultation',
            'arrived_at' => $arrivedAt,
            'original_priority' => 'Normal',
            'status' => 'Waiting',
        ]);

        $service = new QueueService();
        $effective = $service->effectivePriority($customer, now());

        $this->assertEquals('Priority', $effective);
    }

    public function test_normal_priority_does_not_escalate_at_59_minutes(): void
    {
        $arrivedAt = now()->subMinutes(59);
        $customer = Customer::create([
            'name' => 'Test',
            'service' => 'Consultation',
            'arrived_at' => $arrivedAt,
            'original_priority' => 'Normal',
            'status' => 'Waiting',
        ]);

        $service = new QueueService();
        $effective = $service->effectivePriority($customer, now());

        $this->assertEquals('Normal', $effective);
    }

    public function test_customers_with_same_priority_are_ordered_by_arrival_time(): void
    {
        $later = Customer::create([
            'name' => 'Later Arrival',
            'service' => 'Consultation',
            'arrived_at' => now()->subMinutes(10),
            'original_priority' => 'Emergency',
            'status' => 'Waiting',
        ]);

        $earlier = Customer::create([
            'name' => 'Earlier Arrival',
            'service' => 'Consultation',
            'arrived_at' => now()->subMinutes(20),
            'original_priority' => 'Emergency',
            'status' => 'Waiting',
        ]);

        $service = new QueueService();
        $queue = $service->getQueue(now());

        $this->assertEquals('Earlier Arrival', $queue->first()->name);
        $this->assertEquals('Later Arrival', $queue->get(1)->name);
    }

}