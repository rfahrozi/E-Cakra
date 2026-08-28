import client from '@/services/http/client'
import type { Task } from '@/types/common'

export interface TaskCreatePayload {
  title: string
  priority?: string
  due_date?: string | null
}

export const tasksApi = {
  list: async (): Promise<Task[]> => {
    const res = await client.get('/tasks')
    return res.data
  },
  create: async (data: TaskCreatePayload): Promise<Task> => {
    const res = await client.post('/tasks', data)
    return res.data
  },
  updateStatus: async (id: string, status: string): Promise<Task> => {
    const res = await client.patch(`/tasks/${id}`, { status })
    return res.data
  },
  delete: async (id: string): Promise<void> => {
    await client.delete(`/tasks/${id}`)
  },
}
