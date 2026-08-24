import axios from 'axios';

const client = axios.create({
  baseURL: 'http://127.0.0.1:8001/api',
  headers: { 'Content-Type': 'application/json' },
});

export default client;

export const getQueue = (asOf) => client.get('/customers/queue', { params: asOf ? { as_of: asOf } : {} });
export const getNext = (asOf) => client.get('/customers/next', { params: asOf ? { as_of: asOf } : {} });
export const createCustomer = (data) => client.post('/customers', data);
export const updateStatus = (id, status) => client.patch(`/customers/${id}/status`, { status });
export const getServing = () => client.get('/customers/serving');