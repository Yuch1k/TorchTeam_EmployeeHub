import { fuzzySearchObjects } from "@/lib/utils/fuzzy-search"

export type Event = {
  id: string
  title: string
  date: Date
  time?: string
  location: string
  description: string
}

export type WorkEvent = {
  id: string
  title: string
  date: Date
  endDate: Date
  type: "online" | "offline" | "deadline"
  location: string
  participants: string[]
  description: string
}

const createDate = (year: number, month: number, day: number, hour = 0, minute = 0): Date => {
  return new Date(year, month - 1, day, hour, minute)
}

const events: Event[] = [
  {
    id: "1",
    title: "Корпоративный тимбилдинг",
    date: createDate(2025, 6, 15),
    time: "14:00",
    location: "Парк Горького",
    description: "Командные игры и барбекю на свежем воздухе",
  },
  {
    id: "2",
    title: "Онлайн-лекция по AI",
    date: createDate(2025, 6, 20),
    time: "11:00",
    location: "Zoom",
    description: "Приглашенный спикер расскажет о последних трендах в AI",
  },
  {
    id: "3",
    title: "Спортивный день",
    date: createDate(2025, 6, 25),
    time: "10:00",
    location: "Спортивный центр 'Олимп'",
    description: "Волейбол, баскетбол и настольный теннис",
  },
]

const workEvents: WorkEvent[] = [
  {
    id: "1",
    title: "Еженедельный статус-митинг",
    date: createDate(2025, 6, 15, 10, 0),
    endDate: createDate(2025, 6, 15, 11, 0),
    type: "online",
    location: "Zoom",
    participants: ["Иванов И.И.", "Петрова А.С.", "Сидоров А.В."],
    description: "Обсуждение текущего статуса проектов и планирование на неделю",
  },
  {
    id: "2",
    title: "Презентация нового продукта",
    date: createDate(2025, 6, 17, 14, 0),
    endDate: createDate(2025, 6, 17, 16, 0),
    type: "offline",
    location: "Конференц-зал 'Москва'",
    participants: ["Иванов И.И.", "Петрова А.С.", "Сидоров А.В.", "Козлов Д.А."],
    description: "Презентация нового продукта для клиентов и партнеров",
  },
  {
    id: "3",
    title: "Дедлайн проекта 'Альфа'",
    date: createDate(2025, 6, 20, 18, 0),
    endDate: createDate(2025, 6, 20, 18, 0),
    type: "deadline",
    location: "",
    participants: ["Иванов И.И.", "Петрова А.С."],
    description: "Финальный срок сдачи проекта 'Альфа'",
  },
  {
    id: "4",
    title: "Обучение по новым технологиям",
    date: createDate(2025, 6, 22, 11, 0),
    endDate: createDate(2025, 6, 22, 13, 0),
    type: "online",
    location: "Microsoft Teams",
    participants: ["Иванов И.И.", "Козлов Д.А."],
    description: "Обучение команды разработки новым технологиям",
  },
  {
    id: "5",
    title: "Ежемесячное собрание отдела",
    date: createDate(2025, 5, 30, 9, 0),
    endDate: createDate(2025, 5, 30, 10, 30),
    type: "offline",
    location: "Конференц-зал 'Санкт-Петербург'",
    participants: ["Иванов И.И.", "Петрова А.С.", "Сидоров А.В.", "Козлов Д.А.", "Смирнова Е.И."],
    description: "Подведение итогов месяца и планирование на следующий",
  },
  {
    id: "6",
    title: "Встреча с клиентом",
    date: createDate(2025, 5, 28, 15, 0),
    endDate: createDate(2025, 5, 28, 16, 0),
    type: "online",
    location: "Google Meet",
    participants: ["Иванов И.И.", "Петрова А.С."],
    description: "Обсуждение требований к новому проекту",
  },
]

export const getEvents = async (): Promise<Event[]> => {
  return events
}

export const searchEvents = async (query: string): Promise<Event[]> => {
  if (!query) return events
  return fuzzySearchObjects(events, query, ["title", "description", "location"])
}

export const getWorkEvents = async (): Promise<WorkEvent[]> => {
  return workEvents
}

export const searchWorkEvents = async (query: string): Promise<WorkEvent[]> => {
  if (!query) return workEvents
  return fuzzySearchObjects(workEvents, query, ["title", "description", "location"])
}

export const getWorkEventsByDate = async (date: Date): Promise<WorkEvent[]> => {
  return workEvents.filter(
    (event) =>
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear(),
  )
}

export const getWorkEventDates = async (): Promise<Date[]> => {
  return workEvents.map((event) => new Date(event.date))
}

export const getWorkEventById = async (id: string): Promise<WorkEvent | undefined> => {
  return workEvents.find((event) => event.id === id)
}

export const getEventById = async (id: string): Promise<Event | undefined> => {
  return events.find((event) => event.id === id)
}
