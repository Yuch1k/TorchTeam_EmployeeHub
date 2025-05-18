import { fuzzySearchObjects } from "@/lib/utils/fuzzy-search"
import type { Employee } from "./employees"

export type Task = {
  id: string
  title: string
  description: string
  deadline: Date
  status: "in-progress" | "completed"
  authorId: string
  executorIds: string[]
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Подготовить отчет за квартал",
    description: "Собрать данные и подготовить квартальный отчет для руководства",
    deadline: new Date(2025, 5, 20),
    status: "in-progress",
    authorId: "3",
    executorIds: ["1", "2"],
  },
  {
    id: "2",
    title: "Обновить дизайн главной страницы",
    description: "Внести изменения в дизайн главной страницы согласно новому брендбуку",
    deadline: new Date(2025, 5, 25),
    status: "in-progress",
    authorId: "3",
    executorIds: ["2"],
  },
  {
    id: "3",
    title: "Провести интервью с кандидатами",
    description: "Провести собеседования с кандидатами на должность разработчика",
    deadline: new Date(2025, 5, 15),
    status: "completed",
    authorId: "5",
    executorIds: ["3", "4"],
  },
]

export const getTasks = async (): Promise<Task[]> => {
  return tasks
}

export const searchTasks = async (query: string, status?: Task["status"]): Promise<Task[]> => {
  const filteredByStatus = status ? tasks.filter((task) => task.status === status) : tasks

  if (!query) return filteredByStatus

  return fuzzySearchObjects(filteredByStatus, query, ["title", "description"])
}

export const getTaskById = async (id: string): Promise<Task | undefined> => {
  return tasks.find((task) => task.id === id)
}

export const addTask = async (task: Omit<Task, "id">): Promise<Task> => {
  const newTask: Task = {
    id: Date.now().toString(),
    ...task,
  }
  tasks.push(newTask)
  return newTask
}

export const updateTaskStatus = async (id: string, status: Task["status"]): Promise<Task | undefined> => {
  const taskIndex = tasks.findIndex((task) => task.id === id)
  if (taskIndex === -1) return undefined

  tasks[taskIndex].status = status
  return tasks[taskIndex]
}

export const getTaskAuthor = async (authorId: string): Promise<Employee | undefined> => {
  const { getEmployeeById } = await import("./employees")
  return getEmployeeById(authorId)
}

export const getTaskExecutors = async (executorIds: string[]): Promise<Employee[]> => {
  const { getEmployeeById } = await import("./employees")
  const executors: Employee[] = []

  for (const id of executorIds) {
    const employee = await getEmployeeById(id)
    if (employee) {
      executors.push(employee)
    }
  }

  return executors
}
