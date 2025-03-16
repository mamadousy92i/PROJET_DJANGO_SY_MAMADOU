import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // URL de mon backend Django
    headers: { 'Content-Type': 'application/json' }
})

export default API
