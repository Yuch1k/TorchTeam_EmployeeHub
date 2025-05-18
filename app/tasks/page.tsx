"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { CalendarIcon, Plus, Search, User, X } from "lucide-react"
import {
  getTasks,
  addTask,
  updateTaskStatus,
  searchTasks,
  getTaskAuthor,
  getTaskExecutors,
  type Task,
} from "@/lib/data/tasks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Employee } from "@/lib/data/employees"
import { getEmployees } from "@/lib/data/employees"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { UserCard } from "@/components/ui/user-card"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "status" | "authorId" | "executorIds">>({
    title: "",
    description: "",
    deadline: new Date(),
  })
  const [selectedExecutors, setSelectedExecutors] = useState<Employee[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredActiveTasks, setFilteredActiveTasks] = useState<Task[]>([])
  const [filteredCompletedTasks, setFilteredCompletedTasks] = useState<Task[]>([])
  const [taskAuthors, setTaskAuthors] = useState<Record<string, Employee>>({})
  const [taskExecutors, setTaskExecutors] = useState<Record<string, Employee[]>>({})
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("")
  const [executorSearchQueries, setExecutorSearchQueries] = useState<string[]>([""]) // For individual field searches
  const [executorDropdownOpenIndex, setExecutorDropdownOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true)
      try {
        const tasksData = await getTasks()
        setTasks(tasksData)
        setFilteredActiveTasks(tasksData.filter((task) => task.status === "in-progress"))
        setFilteredCompletedTasks(tasksData.filter((task) => task.status === "completed"))

        // Load authors and executors for all tasks
        const authorsMap: Record<string, Employee> = {}
        const executorsMap: Record<string, Employee[]> = {}

        for (const task of tasksData) {
          // Load author
          const author = await getTaskAuthor(task.authorId)
          if (author) {
            authorsMap[task.id] = author
          }

          // Load executors
          const executors = await getTaskExecutors(task.executorIds)
          executorsMap[task.id] = executors
        }

        setTaskAuthors(authorsMap)
        setTaskExecutors(executorsMap)

        // Load all employees for executor selection
        const employees = await getEmployees()
        setAllEmployees(employees)
      } catch (error) {
        console.error("Error loading tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  useEffect(() => {
    const filterTasks = async () => {
      if (!searchQuery) {
        setFilteredActiveTasks(tasks.filter((task) => task.status === "in-progress"))
        setFilteredCompletedTasks(tasks.filter((task) => task.status === "completed"))
        return
      }

      try {
        const activeResults = await searchTasks(searchQuery, "in-progress")
        const completedResults = await searchTasks(searchQuery, "completed")

        setFilteredActiveTasks(activeResults)
        setFilteredCompletedTasks(completedResults)
      } catch (error) {
        console.error("Error searching tasks:", error)
      }
    }

    filterTasks()
  }, [searchQuery, tasks])

  const handleAddTask = async () => {
    if (!newTask.title) return

    try {
      // In a real app, you would get the current user's ID
      const currentUserId = "3" // Assuming Сидоров is the current user

      const task = await addTask({
        ...newTask,
        status: "in-progress",
        authorId: currentUserId,
        executorIds: selectedExecutors.map((executor) => executor.id),
      })

      // Load author and executors for the new task
      const author = await getTaskAuthor(task.authorId)
      const executors = await getTaskExecutors(task.executorIds)

      if (author) {
        setTaskAuthors((prev) => ({ ...prev, [task.id]: author }))
      }

      setTaskExecutors((prev) => ({ ...prev, [task.id]: executors }))

      setTasks([...tasks, task])
      setFilteredActiveTasks([...filteredActiveTasks, task])

      setNewTask({
        title: "",
        description: "",
        deadline: new Date(),
      })
      setSelectedExecutors([])
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  const handleToggleTaskStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus = task.status === "completed" ? "in-progress" : "completed"

    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus)
      if (updatedTask) {
        const updatedTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t))
        setTasks(updatedTasks)

        // Update filtered lists
        setFilteredActiveTasks(updatedTasks.filter((t) => t.status === "in-progress"))
        setFilteredCompletedTasks(updatedTasks.filter((t) => t.status === "completed"))
      }
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEmployeeDialogOpen(true)
  }

  const handleAddExecutor = (employee: Employee, index: number) => {
    const updatedExecutors = [...selectedExecutors]
    updatedExecutors[index] = employee
    setSelectedExecutors(updatedExecutors)
    setExecutorDropdownOpenIndex(null)
  }

  const handleRemoveExecutor = (index: number) => {
    const updatedExecutors = [...selectedExecutors]
    updatedExecutors.splice(index, 1)
    setSelectedExecutors(updatedExecutors)
    setExecutorSearchQueries((prev) => prev.filter((_, i) => i !== index))
  }

  const addExecutorField = () => {
    setExecutorSearchQueries((prev) => [...prev, ""])
    setSelectedExecutors((prev) => [...prev, null])
  }

  const filteredEmployees = (query: string) =>
    query
      ? allEmployees.filter(
          (employee) =>
            employee.name.toLowerCase().includes(query.toLowerCase()) ||
            employee.position.toLowerCase().includes(query.toLowerCase()) ||
            employee.department.toLowerCase().includes(query.toLowerCase()),
        )
      : allEmployees

  const renderTaskItem = (task: Task) => {
    const author = taskAuthors[task.id]
    const executors = taskExecutors[task.id] || []

    return (
      <div key={task.id} className="flex items-start gap-2 p-2 md:p-3 border rounded-md">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.status === "completed"}
          onCheckedChange={() => handleToggleTaskStatus(task.id)}
          className="mt-1"
        />
        <div className="grid gap-1 w-full">
          <div className="flex justify-between items-start">
            <Label
              htmlFor={`task-${task.id}`}
              className={`font-medium text-sm md:text-base ${task.status === "completed" ? "line-through opacity-70" : ""}`}
            >
              {task.title}
            </Label>
            
            {/* Executors moved to top right */}
            <div className="flex -space-x-2">
              {executors.map((executor, index) => (
                <TooltipProvider key={executor.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar
                        className="h-6 w-6 border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEmployeeClick(executor)
                        }}
                      >
                        <AvatarImage src={executor.photo || "/placeholder.svg"} alt={executor.name} />
                        <AvatarFallback className="text-xs">
                          {executor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Исполнитель: {executor.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          <p
            className={`text-xs md:text-sm text-muted-foreground ${task.status === "completed" ? "line-through opacity-70" : ""}`}
          >
            {task.description}
          </p>

          {/* Author moved below description */}
          {author && (
            <div className="mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEmployeeClick(author)
                      }}
                    >
                      <User className="h-3 w-3 mr-1" />
                      Автор: {author.name.split(" ")[0]}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Автор задачи: {author.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">Дедлайн: {format(task.deadline, "PPP", { locale: ru })}</p>

            {/* Added "Подробнее" link */}
            <Button 
              variant="link" 
              size="sm" 
              className="h-5 p-0 text-xs underline text-blue-500 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation()
                // Here you would add logic to show task details
                console.log(`Show details for task ${task.id}`)
              }}
            >
              Подробнее
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-0 md:px-4 pb-16 md:pb-0">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Задачи</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить задачу
            </Button>
          </DialogTrigger>
          <DialogContent className="p-4 md:p-6 max-w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новая задача</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Дедлайн</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="deadline"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTask.deadline && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.deadline ? format(newTask.deadline, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.deadline}
                      onSelect={(date) => {
                        setNewTask({ ...newTask, deadline: date || new Date() })
                        setIsDatePickerOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Исполнители</Label>
                <div className="flex flex-col gap-2 mb-2 max-h-[200px] overflow-y-auto">
                  {executorSearchQueries.map((query, index) => (
                    <div key={index} className="flex items-center gap-2 w-full">
                      <div className="relative flex-grow z-50">
                        <Input
                          placeholder="Иванов Иван Иванович"
                          value={query}
                          onChange={(e) => {
                            const updatedQueries = [...executorSearchQueries];
                            updatedQueries[index] = e.target.value;
                            setExecutorSearchQueries(updatedQueries);
                            
                            // Open dropdown when typing
                            if (e.target.value) {
                              setExecutorDropdownOpenIndex(index);
                            }
                            
                            // Clear selected executor when field is cleared
                            if (!e.target.value && selectedExecutors[index]) {
                              const updatedExecutors = [...selectedExecutors];
                              updatedExecutors[index] = null;
                              setSelectedExecutors(updatedExecutors);
                            }
                          }}
                          className="w-full"
                          onFocus={() => {
                            if (filteredEmployees(query).length > 0) {
                              setExecutorDropdownOpenIndex(index);
                            }
                          }}
                        />
                        
                        {executorDropdownOpenIndex === index && filteredEmployees(query).length > 0 && (
                          <div className="absolute z-50 w-full bg-popover border rounded-md shadow-md mt-1">
                            <Command className="rounded-lg border shadow-md">
                              <CommandList className="max-h-[220px] overflow-auto">
                                <CommandEmpty>Сотрудники не найдены</CommandEmpty>
                                <CommandGroup>
                                  {filteredEmployees(query)
                                    .slice(0, 5)
                                    .map((employee) => (
                                      <CommandItem
                                        key={employee.id}
                                        onSelect={() => {
                                          handleAddExecutor(employee, index);
                                          const updatedQueries = [...executorSearchQueries];
                                          updatedQueries[index] = employee.name;
                                          setExecutorSearchQueries(updatedQueries);
                                        }}
                                        className="flex items-center gap-2"
                                      >
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={employee.photo || "/placeholder.svg"} alt={employee.name} />
                                          <AvatarFallback>
                                            {employee.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                          <span className="text-sm">{employee.name}</span>
                                          <span className="text-xs text-muted-foreground">{employee.position}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </div>
                        )}
                      </div>
                      
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => handleRemoveExecutor(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addExecutorField} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить исполнителя
                </Button>
              </div>

              <Button onClick={handleAddTask} disabled={!newTask.title}>
                Добавить задачу
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск задач..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl">Активные задачи</CardTitle>
            <CardDescription>{filteredActiveTasks.length} задач в работе</CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
            {isLoading ? (
              <p className="text-center py-4 text-muted-foreground">Загрузка задач...</p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {filteredActiveTasks.length > 0 ? (
                  filteredActiveTasks.map(renderTaskItem)
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    {searchQuery ? "Активные задачи не найдены по вашему запросу" : "Нет активных задач"}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl">Завершенные задачи</CardTitle>
            <CardDescription>{filteredCompletedTasks.length} задач выполнено</CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
            {isLoading ? (
              <p className="text-center py-4 text-muted-foreground">Загрузка задач...</p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {filteredCompletedTasks.length > 0 ? (
                  filteredCompletedTasks.map(renderTaskItem)
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    {searchQuery ? "Завершенные задачи не найдены по вашему запросу" : "Нет завершенных задач"}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Dialog */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 max-w-[95vw] rounded-xl overflow-hidden border-2 border-red-500" hideCloseButton={true}>
          {selectedEmployee && (
            <UserCard 
              employee={selectedEmployee}
              variant="dialog"
              onClose={() => setIsEmployeeDialogOpen(false)}
              showCloseButton={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
