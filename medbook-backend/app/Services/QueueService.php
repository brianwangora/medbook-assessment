<?php

namespace App\Services;

use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class QueueService
{
    /**
     * Calculate a customer's effective priority at a given point in time.
     * Original priority is never changed — this is a derived value only.
     */
    public function effectivePriority(Customer $customer, Carbon $asOf): string
    {
        $waitedMinutes = $customer->arrived_at->diffInMinutes($asOf);

        return match ($customer->original_priority) {
            'Emergency' => 'Emergency',
            'Priority' => $waitedMinutes >= 45 ? 'Emergency' : 'Priority',
            'Normal' => match (true) {
                $waitedMinutes >= 90 => 'Emergency',
                $waitedMinutes >= 60 => 'Priority',
                default => 'Normal',
            },
        };
    }

    public function getQueue(?Carbon $asOf = null): Collection
    {
        $asOf ??= now();

        $priorityRank = ['Emergency' => 0, 'Priority' => 1, 'Normal' => 2];

        return Customer::where('status', 'Waiting')
            ->get()
            ->map(function (Customer $customer) use ($asOf) {
                $customer->effective_priority = $this->effectivePriority($customer, $asOf);
                $customer->waiting_minutes = $customer->arrived_at->diffInMinutes($asOf);
                return $customer;
            })
            ->sortBy([
                fn ($a, $b) => $priorityRank[$a->effective_priority] <=> $priorityRank[$b->effective_priority],
                fn ($a, $b) => $a->arrived_at <=> $b->arrived_at,
                fn ($a, $b) => $a->id <=> $b->id,
            ])
            ->values();
    }

    public function next(?Carbon $asOf = null): ?Customer
    {
        return $this->getQueue($asOf)->first();
    }
}