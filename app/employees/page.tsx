"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search, ChevronRight } from "lucide-react"
import { getEmployees, getProjects, searchEmployees, type Employee } from "@/lib/data/employees"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserCard } from "@/components/ui/user-card"

export default function EmployeesPage() {
  const [nameFilter, setNameFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [projects, setProjects] = useState<string[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [employeesData, projectsData] = await Promise.all([getEmployees(), getProjects()])
        setEmployees(employeesData)
        setProjects(projectsData)
        setFilteredEmployees(employeesData)
      } catch (error) {
        console.error("Error loading employee data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    const filterEmployees = async () => {
      const results = await searchEmployees(nameFilter, projectFilter === "all" ? undefined : projectFilter)
      setFilteredEmployees(results)
    }

    filterEmployees()
  }, [nameFilter, projectFilter])

  return (
    <div className="container mx-auto px-0 md:px-4 pb-16 md:pb-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Поиск сотрудников</h1>

      <Card className="mb-4 md:mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name-filter" className="mb-1.5 block">
                Поиск
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name-filter"
                  placeholder="Введите имя, должность или отдел"
                  className="pl-8"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="project-filter" className="mb-1.5 block">
                Проект
              </Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger id="project-filter">
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все проекты</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 md:space-y-4">
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Загрузка данных...</p>
        ) : filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <TooltipProvider key={employee.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary dark:border-[#616174]"
                    onClick={() => {
                      setSelectedEmployee(employee)
                      setIsDialogOpen(true)
                    }}
                  >
                    <CardContent className="p-3 md:p-4 flex items-center justify-between">
                      <UserCard employee={employee} variant="compact" />
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Нажмите для просмотра подробной информации</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground">Сотрудники не найдены</p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 max-w-[95vw] rounded-xl overflow-hidden border-2 border-red-500 dark:border-[#616174]" hideCloseButton={true}>
          {selectedEmployee && (
            <UserCard 
              employee={selectedEmployee}
              variant="dialog"
              onClose={() => setIsDialogOpen(false)}
              showCloseButton={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
