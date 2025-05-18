"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  month?: Date
  selected?: Date | Date[]
  onSelect?: (date: Date | undefined) => void
  onMonthChange?: (month: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
  mode?: "single" | "range" | "multiple"
  initialFocus?: boolean
  numberOfMonths?: number
  fromDate?: Date
  toDate?: Date
  captionLayout?: "buttons" | "dropdown"
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  locale?: Locale
  showOutsideDays?: boolean
  fixedWeeks?: boolean
}

function Calendar({
  month,
  selected,
  onSelect,
  onMonthChange,
  disabled,
  className,
  showOutsideDays = true,
}: CalendarProps) {
  // State for the current display month
  const [currentMonth, setCurrentMonth] = React.useState(month || new Date())
  
  // Get first day of month
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  )
  
  // Get last day of month
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  )
  
  // Get days in month
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
  let firstDayWeekday = firstDayOfMonth.getDay()
  // Adjust for week starting on Monday
  firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1
  
  // Function to check if a date is selected
  const isSelected = (date: Date) => {
    if (!selected) return false
    if (Array.isArray(selected)) {
      return selected.some(selectedDate => 
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear()
      )
    }
    return (
      selected.getDate() === date.getDate() &&
      selected.getMonth() === date.getMonth() &&
      selected.getFullYear() === date.getFullYear()
    )
  }

  // Function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Function to check if a date is disabled
  const isDateDisabled = (date: Date) => {
    return disabled ? disabled(date) : false
  }

  // Function to handle date selection
  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return
    onSelect?.(date)
  }

  // Function to go to previous month
  const prevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  // Function to go to next month
  const nextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  // Generate calendar days
  const calendarDays = React.useMemo(() => {
    const days = []
    
    // Previous month days to fill the first week
    const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate()
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push({
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthDays - firstDayWeekday + i + 1),
        isCurrentMonth: false,
      })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
        isCurrentMonth: true,
      })
    }
    
    // Next month days to fill the last week
    const totalCells = Math.ceil((firstDayWeekday + daysInMonth) / 7) * 7
    for (let i = 1; i <= totalCells - (firstDayWeekday + daysInMonth); i++) {
      days.push({
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i),
        isCurrentMonth: false,
      })
    }
    
    return days
  }, [currentMonth, daysInMonth, firstDayWeekday])

  // Weekday names
  const weekDayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  
  // Month names
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

  return (
    <div className={cn("p-3 w-full", className)}>
      {/* Header with month navigation */}
      <div className="flex justify-between items-center mb-4 relative">
        <Button variant="outline" size="icon" onClick={prevMonth} className="h-7 w-7">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium text-sm">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <Button variant="outline" size="icon" onClick={nextMonth} className="h-7 w-7">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {weekDayNames.map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isSelectedDay = isSelected(day.date)
          const isTodayDate = isToday(day.date)
          const isDisabled = isDateDisabled(day.date)
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 p-0 font-normal",
                !day.isCurrentMonth && !showOutsideDays && "invisible",
                !day.isCurrentMonth && showOutsideDays && "text-muted-foreground opacity-50",
                isSelectedDay && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isTodayDate && !isSelectedDay && "border border-primary",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={isDisabled}
              onClick={() => handleDateSelect(day.date)}
            >
              <span className="text-center">{day.date.getDate()}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
