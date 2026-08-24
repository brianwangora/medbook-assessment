import { useState, useEffect, useCallback } from 'react';
import { getQueue, getServing, createCustomer, updateStatus } from './api/client';
import AddCustomerForm from './components/AddCustomerForm';
import QueueTable from './components/QueueTable';
import NextUpBanner from './components/NextUpBanner';
import CurrentlyServing from './components/currentlyServing';

function App() {
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);
  const [serving, setServing] = useState(null);

  const refreshQueue = useCallback(async () => {
    try {
      const [queueRes, servingRes] = await Promise.all([getQueue(), getServing()]);
      setQueue(queueRes.data);
      setServing(servingRes.data);
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
      <CurrentlyServing customer={serving} onStatusChange={handleStatusChange} />
      <AddCustomerForm onSubmit={handleAddCustomer} />
      <QueueTable queue={queue} onStatusChange={handleStatusChange} />
    </div>
  );
}

export default App;