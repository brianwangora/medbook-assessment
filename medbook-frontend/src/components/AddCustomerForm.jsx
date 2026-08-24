import { useState } from 'react';
import './AddCustomerForm.css';

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

            <div className="form-row">
                <div className="form-field">
                    <label htmlFor="name">Name</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-field">
                    <label htmlFor="service">Service Required</label>
                    <input id="service" type="text" value={service} onChange={(e) => setService(e.target.value)} required />
                </div>
            </div>

            <div className="form-row">
                <div className="form-field">
                    <label htmlFor="arrivedAt">Arrival Time</label>
                    <input id="arrivedAt" type="datetime-local" value={arrivedAt} onChange={(e) => setArrivedAt(e.target.value)} required />
                </div>

                <div className="form-field">
                    <label htmlFor="priority">Original Priority</label>
                    <select id="priority" value={originalPriority} onChange={(e) => setOriginalPriority(e.target.value)}>
                        <option value="Normal">Normal</option>
                        <option value="Priority">Priority</option>
                        <option value="Emergency">Emergency</option>
                    </select>
                </div>
            </div>

            <button className="form-button" type="submit" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Customer'}
            </button>
        </form>
    );
}

export default AddCustomerForm;