function formatTime(dateTimeString) {
  return new Date(dateTimeString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function QueueTable({ queue, onStatusChange }) {
  const allowedNextStatuses = {
    'Waiting': [
      { label: 'Start Serving', value: 'Being Served' },
      { label: 'Cancel', value: 'Cancelled' },
    ],
    'Being Served': [
      { label: 'Complete', value: 'Completed' },
      { label: 'Return to Waiting', value: 'Waiting' },
    ],
    'Completed': [],
    'Cancelled': [],
  };

  if (queue.length === 0) {
    return <p>No customers currently waiting.</p>;
  }

  return (
    <div>
        <h2>Queue Table</h2>
        <table style={{border: "1px solid", width: "100%", padding: "8px",}}>
            <thead>
                <tr>
                <th>Name</th>
                <th>Service</th>
                <th>Original Priority</th>
                <th>Effective Priority</th>
                <th>Arrival Time</th>
                <th>Waiting Time (min)</th>
                <th>Status</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {queue.map((customer) => (
                <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.service}</td>
                    <td>{customer.original_priority}</td>
                    <td>{customer.effective_priority}</td>
                    <td>{formatTime(customer.arrived_at)}</td>
                    <td>{Math.round(customer.waiting_minutes)}</td>
                    <td>{customer.status}</td>
                    <td>
                    {allowedNextStatuses[customer.status].map((action) => (
                        <button
                            key={action.value}
                            onClick={() => onStatusChange(customer.id, action.value)}
                        >
                        {action.label}
                        </button>
                    ))}
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}

export default QueueTable;