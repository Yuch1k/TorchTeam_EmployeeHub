"use client"

import { X } from "lucide-react"
import { type Employee } from "@/lib/data/employees"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

// Types for our user card component
export interface UserCardProps {
  employee: Employee
  variant?: "compact" | "detailed" | "dialog"
  onClose?: () => void
  showCloseButton?: boolean
}

export function UserCard({
  employee,
  variant = "compact",
  onClose,
  showCloseButton = false,
}: UserCardProps) {
  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  // Parse the birth date from the employee data
  const formattedBirthDate = employee.birthDate ? formatDate(new Date(employee.birthDate)) : null
  
  // Check if employee has any projects
  const hasProjects = employee.projects && employee.projects.length > 0

  // Split name into surname, name and patronym
  const nameParts = employee.name.split(' ');
  const surname = nameParts[0] || '';
  const nameAndPatronym = nameParts.slice(1).join(' ');

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 md:gap-4">
        <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-red-500">
          <AvatarImage src={employee.photo || "/placeholder.svg"} alt={employee.name} />
          <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">{employee.name}</h3>
          <p className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">{employee.position}</p>
        </div>
      </div>
    )
  }

  if (variant === "detailed") {
    return (
      <div className="flex items-start gap-4 p-4">
        <Avatar className="h-16 w-16 border-2 border-red-500">
          <AvatarImage src={employee.photo || "/placeholder.svg"} alt={employee.name} />
          <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div>
            <div className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">{surname}</div>
            <div className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">{nameAndPatronym}</div>
            <p className="text-base text-[#000000] dark:text-[#F8FAFF] mt-1">{employee.position}</p>
          </div>
          <div>
            {formattedBirthDate && (
              <p className="text-base text-[#000000] dark:text-[#F8FAFF]">
                <span className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">Дата рождения:</span> {formattedBirthDate}
              </p>
            )}
          </div>
          {hasProjects && (
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">Проекты:</span>
              {employee.projects?.map((project) => (
                <Badge key={project} variant="outline" className="text-base border-[1.8px] border-[#E1E1E1] dark:border-[#616174] text-[#000000] dark:text-[#F8FAFF]">
                  {project}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">Хобби:</span>
            {employee.hobbies.map((hobby) => (
              <Badge key={hobby} variant="outline" className="text-base bg-[#E1E1E1] dark:bg-[#616174] dark:border-[1.8px] dark:border-[#616174] text-[#000000] dark:text-[#F8FAFF]">
                {hobby}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Dialog variant (full card)
  return (
    <div className="p-6 relative">
      {showCloseButton && (
        <button 
          className="absolute top-4 right-4 rounded-full hover:bg-accent p-2 transition-colors"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      
      <div className="flex flex-col items-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full border-2 border-red-500 p-1">
            <Avatar className="h-24 w-24">
              <AvatarImage src={employee.photo || "/placeholder.svg"} alt={employee.name} />
              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-medium text-[#000000] dark:text-[#F8FAFF]">{surname}</h2>
          <h2 className="text-xl text-[#000000] dark:text-[#F8FAFF]">{nameAndPatronym}</h2>
          <p className="text-base text-[#000000] dark:text-[#F8FAFF] mt-1">{employee.position}</p>
        </div>
        
        <div className="w-full mt-6">
          {formattedBirthDate && (
            <p className="mb-3 text-base text-[#000000] dark:text-[#F8FAFF]">
              <span className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">Дата рождения:</span> {formattedBirthDate}
            </p>
          )}
          
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">Департамент:</span>
            <Badge variant="outline" className="text-base border-[1.8px] border-[#E1E1E1] dark:border-[#616174] text-[#000000] dark:text-[#F8FAFF] py-1 px-3">{employee.department}</Badge>
          </div>
          
          {hasProjects && (
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <span className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">Проекты:</span>
              {employee.projects?.map((project) => (
                <Badge key={project} variant="outline" className="text-base border-[1.8px] border-[#E1E1E1] dark:border-[#616174] text-[#000000] dark:text-[#F8FAFF] py-1 px-3">
                  {project}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-medium text-base text-[#000000] dark:text-[#F8FAFF]">Хобби:</span>
            {employee.hobbies.map((hobby) => (
              <Badge key={hobby} variant="outline" className="text-base bg-[#E1E1E1] dark:bg-[#616174] border-[1.8px] border-[#E1E1E1] dark:border-[#616174] text-[#000000] dark:text-[#F8FAFF] py-1 px-3">
                {hobby}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}