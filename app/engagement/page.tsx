"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Clock } from "lucide-react"
import { getEvents, searchEvents, type Event } from "@/lib/data/events"
import { getHobbies, getEmployeesByHobby, type Employee } from "@/lib/data/employees"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function EngagementPage() {
  const [selectedHobby, setSelectedHobby] = useState("")
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [hobbies, setHobbies] = useState<string[]>([])
  const [employeesByHobby, setEmployeesByHobby] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [eventSearchQuery, setEventSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [eventsData, hobbiesData] = await Promise.all([getEvents(), getHobbies()])
        setEvents(eventsData)
        setFilteredEvents(eventsData)
        setHobbies(hobbiesData)
      } catch (error) {
        console.error("Error loading engagement data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    const loadEmployeesByHobby = async () => {
      if (!selectedHobby) {
        setEmployeesByHobby([])
        return
      }

      try {
        const employees = await getEmployeesByHobby(selectedHobby)
        setEmployeesByHobby(employees)
      } catch (error) {
        console.error("Error loading employees by hobby:", error)
        setEmployeesByHobby([])
      }
    }

    loadEmployeesByHobby()
  }, [selectedHobby])

  useEffect(() => {
    const searchForEvents = async () => {
      if (!eventSearchQuery) {
        setFilteredEvents(events)
        return
      }

      try {
        const results = await searchEvents(eventSearchQuery)
        setFilteredEvents(results)
      } catch (error) {
        console.error("Error searching events:", error)
      }
    }

    searchForEvents()
  }, [eventSearchQuery, events])

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEmployeeDialogOpen(true)
  }

  return (
    <div className="container mx-auto px-0 md:px-4 pb-16 md:pb-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Активность</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div>
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-semibold">Ближайшие мероприятия</h2>
          </div>

          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск мероприятий..."
                  className="pl-8"
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Загрузка данных...</p>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader className="p-3 md:p-4 pb-0 md:pb-0">
                    <CardTitle className="text-base md:text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col gap-1 md:gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.date).toLocaleDateString("ru-RU")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <Button className="mt-3 md:mt-4 w-full">Подробнее</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Мероприятия не найдены</p>
          )}
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Поиск людей по хобби</h2>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="mb-4 md:mb-6">
                <Select value={selectedHobby} onValueChange={setSelectedHobby}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите хобби" />
                  </SelectTrigger>
                  <SelectContent>
                    {hobbies.map((hobby) => (
                      <SelectItem key={hobby} value={hobby}>
                        {hobby}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedHobby ? (
                employeesByHobby.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {employeesByHobby.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 md:gap-4 p-2 rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => handleEmployeeClick(employee)}
                      >
                        <Avatar className="h-10 w-10 md:h-12 md:w-12">
                          <AvatarImage
                            src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${employee.name}`}
                            alt={employee.name}
                          />
                          <AvatarFallback>
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-sm md:text-base">{employee.name}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground">{employee.position}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {employee.hobbies.map((hobby) => (
                              <Badge key={hobby} variant="secondary" className="text-xs">
                                {hobby}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Сотрудники с таким хобби не найдены</p>
                )
              ) : (
                <p className="text-center py-4 text-muted-foreground">Выберите хобби для поиска сотрудников</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Employee Dialog */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-4 md:p-6 max-w-[95vw]">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEmployee.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${selectedEmployee.name}`}
                      alt={selectedEmployee.name}
                    />
                    <AvatarFallback>
                      {selectedEmployee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Должность:</div>
                  <div>{selectedEmployee.position}</div>

                  <div className="font-medium">Хобби:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedEmployee.hobbies.map((hobby) => (
                      <Badge key={hobby} variant="secondary" className="text-xs">
                        {hobby}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
