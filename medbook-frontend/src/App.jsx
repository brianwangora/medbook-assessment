import { useState, useEffect, useCallback } from 'react';
import { getQueue, createCustomer, updateStatus } from './api/client';
import AddCustomerForm from './components/AddCustomerForm';
import QueueTable from './components/QueueTable';
import NextUpBanner from './components/NextUpBanner';

function App() {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);

  const refreshQueue = useCallback(async () => {
    try {
      const res = await getQueue();
      setQueue(res.data);
      setError(null);
    } catch (err) {
      setError('Could not load queue.');
    }
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  const handleAddCustomer = async (formData) => {
    try {
      await createCustomer(formData);
      await refreshQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add customer.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus);
      await refreshQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status.');
    }
  };

  return (
    <div>
      <h1>Medbook Queue</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <NextUpBanner queue={queue} />
      <AddCustomerForm onSubmit={handleAddCustomer} />
      <QueueTable queue={queue} onStatusChange={handleStatusChange} />
    </div>
  );
}

export default App;