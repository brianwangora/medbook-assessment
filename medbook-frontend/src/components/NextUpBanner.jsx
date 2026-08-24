function NextUpBanner({ queue }) {
  if (queue.length === 0) {
    return (
      <div style={{ padding: '1rem', border: '2px solid #666', marginBottom: '1rem' }}>
        <strong>No customers waiting.</strong>
      </div>
    );
  }

  const next = queue[0];

  return (
    <div style={{ padding: '1rem', border: '2px solid green', marginBottom: '1rem' }}>
      <strong>Next to be served:</strong> {next.name} — {next.service}
      {' '}(effective priority: {next.effective_priority}, waiting {Math.round(next.waiting_minutes)} min)
    </div>
  );
}

export default NextUpBanner;