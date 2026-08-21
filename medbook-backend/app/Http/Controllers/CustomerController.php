<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Models\Customer;
use App\Services\QueueService;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(protected QueueService $queueService) {}

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create([
            ...$request->validated(),
            'status' => 'Waiting',
        ]);

        return response()->json($customer, 201);
    }

    public function queue(Request $request)
    {
        $asOf = $request->has('as_of')
            ? \Carbon\Carbon::parse($request->query('as_of'))
            : now();

        return response()->json(
            $this->queueService->getQueue($asOf)->values()
        );
    }

    public function next(Request $request)
    {
        $asOf = $request->has('as_of')
            ? \Carbon\Carbon::parse($request->query('as_of'))
            : now();

        $customer = $this->queueService->next($asOf);

        if (!$customer) {
            return response()->json(['message' => 'No customers waiting.'], 200);
        }

        return response()->json($customer);
    }

    public function updateStatus(Request $request, Customer $customer)
    {
        $request->validate([
            'status' => 'required|in:Waiting,Being Served,Completed,Cancelled',
        ]);

        $newStatus = $request->input('status');

        $allowedTransitions = [
            'Waiting' => ['Being Served', 'Cancelled'],
            'Being Served' => ['Completed', 'Waiting'],
            'Completed' => [],
            'Cancelled' => [],
        ];

        if (!in_array($newStatus, $allowedTransitions[$customer->status])) {
            return response()->json([
                'message' => "Cannot transition from '{$customer->status}' to '{$newStatus}'.",
            ], 422);
        }

        if ($newStatus === 'Being Served') {
            $alreadyServing = Customer::where('status', 'Being Served')
                ->where('id', '!=', $customer->id)
                ->lockForUpdate()
                ->exists();

            if ($alreadyServing) {
                return response()->json([
                    'message' => 'Another customer is already being served.',
                ], 409);
            }
        }

        $customer->update(['status' => $newStatus]);

        return response()->json($customer);
    }
}