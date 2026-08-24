import { useState } from 'react';

function AddCustomerForm({ onSubmit }) {
    const [name, setName] = useState('');
    const [service, setService] = useState('');
    const [arrivedAt, setArrivedAt] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });  
    const [originalPriority, setOriginalPriority] = useState('Normal');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        await onSubmit({
        name,
        service,
        arrived_at: arrivedAt,
        original_priority: originalPriority,
        });

        setSubmitting(false);
        setName('');
        setService('');
        setArrivedAt('');
        setOriginalPriority('Normal');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add a Customer to the Queue</h2>

            <label>
                Name
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                />
            </label>

            <label>
                Service Required
                <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                required
                />
            </label>

            <label>
                Arrival Time
                <input
                type="datetime-local"
                value={arrivedAt}
                onChange={(e) => setArrivedAt(e.target.value)}
                required
                />
            </label>

            <label>
                Original Priority
                <select
                value={originalPriority}
                onChange={(e) => setOriginalPriority(e.target.value)}
                >
                <option value="Normal">Normal</option>
                <option value="Priority">Priority</option>
                <option value="Emergency">Emergency</option>
                </select>
            </label>

            <button type="submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Customer'}
            </button>
        </form>
    );
}

export default AddCustomerForm;