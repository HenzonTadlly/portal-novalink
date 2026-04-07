import axios from 'axios';

const api = axios.create({
  // Trocamos o localhost pelo seu servidor na nuvem!
  baseURL: 'https://portal-novalink.onrender.com/api' 
});

export default api;