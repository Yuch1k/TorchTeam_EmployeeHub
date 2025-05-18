export type Employee = {
  id: string
  name: string
  position: string
  projects?: string[]
  hobbies: string[]
  team: string
  department: string
  gender: string
  manager: string
  messenger: string
  photo: string
  birthDate?: string
}

const getPixelArtAvatar = (seed: string) => {
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`
}

const employees: Employee[] = [
  {
    id: "1",
    name: "Иванов Иван Иванович",
    position: "Frontend-разработчик",
    projects: ["Альфа"],
    hobbies: ["Шахматы", "Программирование"],
    team: "Разработка",
    department: "IT",
    gender: "Мужской",
    manager: "Петров Петр Петрович",
    messenger: "slack://user/U01234567",
    photo: getPixelArtAvatar("ivanov"),
    birthDate: "1990-01-01",
  },
  {
    id: "2",
    name: "Петрова Анна Сергеевна",
    position: "UX/UI дизайнер",
    projects: ["Бета"],
    hobbies: ["Фотография", "Рисование"],
    team: "Дизайн",
    department: "Продукт",
    gender: "Женский",
    manager: "Сидоров Алексей Владимирович",
    messenger: "slack://user/U07654321",
    photo: getPixelArtAvatar("petrova"),
    birthDate: "1985-05-23",
  },
  {
    id: "3",
    name: "Сидоров Алексей Владимирович",
    position: "Руководитель отдела",
    projects: ["Руководство"],
    hobbies: ["Бег", "Плавание", "Йога"],
    team: "Руководство",
    department: "Продукт",
    gender: "Мужской",
    manager: "Козлов Дмитрий Александрович",
    messenger: "slack://user/U09876543",
    photo: getPixelArtAvatar("sidorov"),
    birthDate: "1992-08-12",
  },
  {
    id: "4",
    name: "Козлов Дмитрий Александрович",
    position: "Backend-разработчик",
    projects: ["Альфа"],
    hobbies: ["Шахматы", "Настольные игры"],
    team: "Разработка",
    department: "IT",
    gender: "Мужской",
    manager: "Сидоров Алексей Владимирович",
    messenger: "slack://user/U01234568",
    photo: getPixelArtAvatar("kozlov"),
    birthDate: "1988-03-14",
  },
  {
    id: "5",
    name: "Смирнова Елена Игоревна",
    position: "HR-менеджер",
    projects: ["Руководство"],
    hobbies: ["Бег", "Кулинария"],
    team: "HR",
    department: "Управление персоналом",
    gender: "Женский",
    manager: "Сидоров Алексей Владимирович",
    messenger: "slack://user/U01234569",
    photo: getPixelArtAvatar("smirnova"),
    birthDate: "1993-07-05",
  },
]

export const getEmployees = async (): Promise<Employee[]> => {
  return employees
}

export const getEmployeeById = async (id: string): Promise<Employee | undefined> => {
  return employees.find((employee) => employee.id === id)
}

export const getEmployeeByName = async (name: string): Promise<Employee | undefined> => {
  let employee = employees.find((emp) => emp.name === name)

  if (!employee) {
    const nameParts = name.split(" ")
    if (nameParts.length >= 2) {
      const lastName = nameParts[0]
      const initials = nameParts.slice(1).join("")

      employee = employees.find((emp) => {
        const empNameParts = emp.name.split(" ")
        const empLastName = empNameParts[0]
        const empInitials = empNameParts
          .slice(1)
          .map((part) => part[0] + ".")
          .join("")

        return empLastName === lastName && empInitials.includes(initials.replace(/\./g, ""))
      })
    }
  }

  return employee
}

export const searchEmployees = async (query: string, project?: string): Promise<Employee[]> => {
  const filteredByProject =
    project && project !== "all" ? employees.filter((employee) => employee.projects?.includes(project)) : employees

  if (!query) return filteredByProject

  return fuzzySearchObjects(filteredByProject, query, ["name", "position", "department"])
}

export const getEmployeesByHobby = async (hobby: string): Promise<Employee[]> => {
  return employees.filter((employee) => employee.hobbies.some((empHobby) => fuzzySearch(empHobby, hobby) > 0))
}

export const getHobbies = async (): Promise<string[]> => {
  const allHobbies = employees.flatMap((employee) => employee.hobbies)
  return Array.from(new Set(allHobbies))
}

export const getProjects = async (): Promise<string[]> => {
  return Array.from(new Set(employees.flatMap((employee) => employee.projects || [])))
}

import { fuzzySearch, fuzzySearchObjects } from "@/lib/utils/fuzzy-search"
