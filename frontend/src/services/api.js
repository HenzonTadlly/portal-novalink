// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3333/api', // O endereço do nosso Back-end!
});

export default api;