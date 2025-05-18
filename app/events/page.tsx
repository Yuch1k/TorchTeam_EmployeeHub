"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Search } from "lucide-react"
import { getWorkEvents, getWorkEventDates, getWorkEventsByDate, type WorkEvent } from "@/lib/data/events"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Функция для форматирования даты на русском
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Форматируем время события
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Названия месяцев на русском
const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
]

// Названия дней недели на русском
const weekDayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

// Add a new function to get events within a date range
const getWorkEventsInRange = async (
  startDate: Date,
  endDate: Date | null
): Promise<WorkEvent[]> => {
  if (!endDate) return getWorkEventsByDate(startDate);
  
  // Get all events first
  const allEvents = await getWorkEvents();
  
  return allEvents.filter((event) => {
    const eventDate = new Date(event.date);
    // Reset the time part to compare only dates
    const eventDateOnly = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );
    
    const startDateOnly = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    
    const endDateOnly = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );
    
    return eventDateOnly >= startDateOnly && eventDateOnly <= endDateOnly;
  });
};

export default function EventsPage() {
  // Текущая дата для отображения в календаре
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<WorkEvent[]>([])
  const [eventDates, setEventDates] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<WorkEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<WorkEvent | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  })
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 3
  
  // Получаем события при загрузке страницы
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [eventsData, datesData] = await Promise.all([
          getWorkEvents(),
          getWorkEventDates()
        ])
        setEvents(eventsData)
        setEventDates(datesData)
      } catch (error) {
        console.error("Ошибка загрузки событий:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Получаем события для выбранного дня или диапазона
  useEffect(() => {
    const getEventsForDateRange = async () => {
      if (!selectedRange.start) return;

      try {
        let dateEvents: WorkEvent[] = [];
        
        if (selectedRange.end) {
          // If we have a date range, get events within that range
          dateEvents = await getWorkEventsInRange(selectedRange.start, selectedRange.end);
        } else {
          // If we only have a single date selected
          dateEvents = await getWorkEventsByDate(selectedRange.start);
        }
        
        setSelectedEvents(dateEvents);
      } catch (error) {
        console.error("Ошибка загрузки событий для выбранной даты:", error);
      }
    };

    getEventsForDateRange();
  }, [selectedRange])

  // Получаем первый и последний день месяца
  const { firstDayOfMonth, lastDayOfMonth, daysInMonth } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    return {
      firstDayOfMonth: firstDay,
      lastDayOfMonth: lastDay,
      daysInMonth: lastDay.getDate(),
    }
  }, [currentDate])

  // Получаем дни для отображения в календаре
  const calendarDays = useMemo(() => {
    const days = []
    
    // Вычисляем день недели первого дня месяца (0 - понедельник, 6 - воскресенье)
    let firstDayWeekday = firstDayOfMonth.getDay()
    firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1
    
    // Добавляем дни предыдущего месяца
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
    
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - firstDayWeekday + i + 1),
        isCurrentMonth: false,
      })
    }
    
    // Добавляем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isCurrentMonth: true,
      })
    }
    
    // Добавляем дни следующего месяца для заполнения сетки
    const totalCells = Math.ceil((firstDayWeekday + daysInMonth) / 7) * 7
    
    for (let i = 1; i <= totalCells - (firstDayWeekday + daysInMonth); i++) {
      days.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
        isCurrentMonth: false,
      })
    }
    
    return days
  }, [firstDayOfMonth, daysInMonth, currentDate])

  // Функция для перехода к следующему месяцу
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Функция для перехода к предыдущему месяцу
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Функция проверки наличия событий в этот день
  const hasEventsOnDay = (date: Date) => {
    return eventDates.some(eventDate => 
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    )
  }

  // Функция для выбора дня
  const handleDayClick = (date: Date) => {
    if (selectedRange.start && !selectedRange.end) {
      // Если начальная дата выбрана, но конечная нет
      if (date < selectedRange.start) {
        // Если выбрали дату раньше стартовой, меняем местами
        setSelectedRange({
          start: date,
          end: selectedRange.start,
        })
      } else {
        setSelectedRange({
          ...selectedRange,
          end: date,
        })
      }
    } else {
      // Начинаем новый выбор
      setSelectedRange({
        start: date,
        end: null,
      })
    }
    
    setSelectedDate(date)
  }

  // Проверка находится ли день в выбранном диапазоне
  const isDateInRange = (date: Date) => {
    if (!selectedRange.start) return false
    if (!selectedRange.end) return date.getTime() === selectedRange.start.getTime()
    
    return date >= selectedRange.start && date <= selectedRange.end
  }

  // Функция для сброса выбранного диапазона
  const resetSelection = () => {
    setSelectedRange({ start: null, end: null })
    setSelectedDate(null)
    setSelectedEvents([])
  }

  // Обработка клика по событию
  const handleEventClick = (event: WorkEvent) => {
    setSelectedEvent(event)
    setIsEventDialogOpen(true)
  }

  // Определяем класс типа события
  const getEventTypeClass = (type: string) => {
    switch (type) {
      case "online":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "offline":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "deadline":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getEventTypeText = (type: string) => {
    switch (type) {
      case "online":
        return "Онлайн"
      case "offline":
        return "Оффлайн"
      case "deadline":
        return "Дедлайн"
      default:
        return type
    }
  }

  return (
    <div className="container mx-auto px-0 md:px-4 pb-16 md:pb-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Календарь</h1>

      <div className="flex flex-col gap-4 md:gap-6">
        <Card>
          <CardContent className="p-3 md:p-6">
            {/* Заголовок календаря с навигацией по месяцам */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-medium">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Дни недели */}
            <div className="grid grid-cols-7 mb-2 text-center">
              {weekDayNames.map((day) => (
                <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Дни месяца */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isToday = 
                  day.date.getDate() === new Date().getDate() && 
                  day.date.getMonth() === new Date().getMonth() &&
                  day.date.getFullYear() === new Date().getFullYear()
                
                const hasEvents = hasEventsOnDay(day.date)
                const isSelected = isDateInRange(day.date)
                
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`p-0 h-9 md:h-12 ${
                      !day.isCurrentMonth ? "text-muted-foreground opacity-50" : ""
                    } ${isToday ? "border border-primary" : ""} ${
                      isSelected ? "bg-primary/20" : ""
                    }`}
                    onClick={() => handleDayClick(day.date)}
                  >
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <span className="block">{day.date.getDate()}</span>
                      {hasEvents && (
                        <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />
                      )}
                      {!hasEvents && <div className="w-1 h-1 mt-0.5" />}
                    </div>
                  </Button>
                )
              })}
            </div>

            {/* Отображение выбранного диапазона */}
            {selectedRange.start && (
              <div className="mt-4 text-sm">
                <p>
                  {selectedRange.end ? (
                    <>
                      Выбран период: {formatDate(selectedRange.start)} — {formatDate(selectedRange.end)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetSelection}
                        className="ml-2 h-7 px-2"
                      >
                        Сбросить
                      </Button>
                    </>
                  ) : (
                    <>
                      Выбрана дата: {formatDate(selectedRange.start)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetSelection}
                        className="ml-2 h-7 px-2"
                      >
                        Сбросить
                      </Button>
                    </>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* События выбранного дня или диапазона */}
        {selectedDate && (
          <Card>
            <CardContent className="p-3 md:p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedRange.end ? 
                  `События за период: ${formatDate(selectedRange.start!)} — ${formatDate(selectedRange.end)}` : 
                  `События на ${formatDate(selectedDate)}`
                }
              </h2>

              {selectedEvents.length > 0 ? (
                <div className="flex flex-col space-y-3">
                  {selectedEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage).map((event) => (
                    <Card key={event.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors duration-200"
                      onClick={() => handleEventClick(event)}>
                      <CardContent className="p-3 md:p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-2 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {formatTime(event.date)} - {formatTime(event.endDate)}
                              </div>
                              {event.location && (
                                <div className="flex items-center text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={getEventTypeClass(event.type)}>
                            {getEventTypeText(event.type)}
                          </Badge>
                        </div>
                        {/* Show event date when displaying a range of events */}
                        {selectedRange.end && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <CalendarIcon className="inline h-3 w-3 mr-1" />
                            {formatDate(event.date)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {selectedRange.end ? 
                    "За выбранный период нет запланированных событий" : 
                    "На этот день нет запланированных событий"
                  }
                </div>
              )}

              {/* Pagination controls */}
              {selectedEvents.length > eventsPerPage && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Предыдущая
                  </Button>
                  <span className="mx-2 text-sm">
                    Страница {currentPage} из {Math.ceil(selectedEvents.length / eventsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(selectedEvents.length / eventsPerPage)))}
                    disabled={currentPage === Math.ceil(selectedEvents.length / eventsPerPage)}
                  >
                    Следующая
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Диалоговое окно с детальной информацией о событии */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="rounded-2xl overflow-hidden border-2 border-red-500 dark:border-[#616174] max-w-[95vw] sm:max-w-[500px] p-6">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(selectedEvent.date)} - {formatTime(selectedEvent.endDate)}</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                <Badge className={getEventTypeClass(selectedEvent.type)}>
                  {getEventTypeText(selectedEvent.type)}
                </Badge>
                {selectedEvent.participants.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.participants.map((participant, index) => (
                        <Badge key={index} variant="outline">
                          {participant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEvent.description && (
                  <div>
                    <p className="mb-1 font-medium">Описание:</p>
                    <p className="text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}