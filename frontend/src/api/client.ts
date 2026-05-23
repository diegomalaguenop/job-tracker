// src/api/client.ts
import axios from 'axios'

const client = axios.create({
  baseURL: '/applications',
  headers: { 'Content-Type': 'application/json' },
})

export default client
