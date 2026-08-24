import './CurrentlyServing.css';

function CurrentlyServing({ customer, onStatusChange }) {
  if (!customer) {
    return <p>No one is currently being served.</p>;
  }

  return (
    <div style={{ padding: '1rem', border: '2px solid orange', marginBottom: '1rem' }}>
      <strong>Currently serving:</strong> {customer.name} — {customer.service}
      <div className="serve-buttons">
        <button className="complete-button" onClick={() => onStatusChange(customer.id, 'Completed')}>Complete</button>
        <button className="return-button" onClick={() => onStatusChange(customer.id, 'Waiting')}>Return to Waiting</button>
      </div>
    </div>
  );
}

export default CurrentlyServing;