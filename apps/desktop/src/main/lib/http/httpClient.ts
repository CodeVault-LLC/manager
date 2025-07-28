import axios from 'axios'

const httpClient = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent': 'Manager Desktop App'
  }
})

httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.headers['retry-after']) {
      const delay = parseInt(err.response.headers['retry-after'], 10) * 1000
      return new Promise((resolve) =>
        setTimeout(() => resolve(httpClient(err.config)), delay)
      )
    }
    return Promise.reject(err)
  }
)

export default httpClient
