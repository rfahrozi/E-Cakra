import { useState, useEffect } from 'react'
import axiosClient from '../lib/axios'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    axiosClient
      .get<T>(url)
      .then((res) => {
        if (!cancelled) setState({ data: res.data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: err.message ?? 'Terjadi kesalahan' })
      })

    return () => { cancelled = true }
  }, [url])

  return state
}
