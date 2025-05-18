"use client"

import { useState, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, CalendarIcon, Clock, MapPin } from "lucide-react"
import { getEmployeeById } from "@/lib/data/employees"
import { getEventById } from "@/lib/data/events"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserCard } from "@/components/ui/user-card"
import type { Employee } from "@/lib/data/employees"
import type { Event } from "@/lib/data/events"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

type EntityReference = {
  type: "user" | "event"
  id: string
  fullMatch: string
  entity?: Employee | Event
  name?: string
}

// Event Card component for consistent display in dialogs
const EventCard = ({ event }: { event: Event }) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 relative">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{event.time}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
        )}
        <div>
          <p className="mb-1 font-medium">Описание:</p>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
      </div>
    </div>
  );
};

// Create a separate component for message content to avoid hook order issues
const MessageContent = memo(({ content, messageId }: { content: string, messageId: string }) => {
  const [elements, setElements] = useState<React.ReactNode[]>([
    <div key="loading" className="whitespace-pre-line text-sm md:text-base">{content}</div>
  ]);
  
  useEffect(() => {
    let isMounted = true;
    
    const parseEntityReferences = async (content: string): Promise<EntityReference[]> => {
      const userPattern = /<u:(\d+)>/g;
      const eventPattern = /<e:(\d+)>/g;
      
      const entityReferences: EntityReference[] = [];
      
      // Find all user references
      let match;
      while ((match = userPattern.exec(content)) !== null) {
        const id = match[1];
        const fullMatch = match[0];
        const employee = await getEmployeeById(id);
        
        entityReferences.push({
          type: "user",
          id,
          fullMatch,
          entity: employee,
          name: employee?.name
        });
      }
      
      // Find all event references
      while ((match = eventPattern.exec(content)) !== null) {
        const id = match[1];
        const fullMatch = match[0];
        const event = await getEventById(id);
        
        entityReferences.push({
          type: "event",
          id,
          fullMatch,
          entity: event,
          name: event?.title
        });
      }
      
      return entityReferences;
    };
    
    const handleEntityClick = (entity: EntityReference) => {
      if (entity.type === "user" && entity.entity) {
        window.dispatchEvent(new CustomEvent('showEmployeeDialog', { 
          detail: { employee: entity.entity } 
        }));
      } else if (entity.type === "event" && entity.entity) {
        window.dispatchEvent(new CustomEvent('showEventDialog', { 
          detail: { event: entity.entity } 
        }));
      }
    };
    
    const processEntityReferences = async () => {
      const entityReferences = await parseEntityReferences(content);
      
      if (!isMounted || entityReferences.length === 0) return;
      
      let lastIndex = 0;
      const newElements: React.ReactNode[] = [];
      
      entityReferences.forEach((entity, i) => {
        const index = content.indexOf(entity.fullMatch, lastIndex);
        
        // Add text before entity reference
        if (index > lastIndex) {
          newElements.push(
            <span key={`text-${messageId}-${i}`}>{content.substring(lastIndex, index)}</span>
          );
        }
        
        // Add clickable entity reference with actual name instead of ID
        if (entity.name) {
          newElements.push(
            <button
              key={`entity-${messageId}-${i}`}
              onClick={() => handleEntityClick(entity)}
              className="text-primary underline font-medium"
            >
              {entity.type === "user" ? entity.name : entity.name}
            </button>
          );
        } else {
          // Fallback if name is not available
          newElements.push(
            <button
              key={`entity-${messageId}-${i}`}
              onClick={() => handleEntityClick(entity)}
              className="text-primary underline font-medium"
            >
              {entity.type === "user" ? "Сотрудник" : "Событие"} #{entity.id}
            </button>
          );
        }
        
        lastIndex = index + entity.fullMatch.length;
      });
      
      // Add remaining text after last entity reference
      if (lastIndex < content.length) {
        newElements.push(
          <span key={`text-${messageId}-last`}>{content.substring(lastIndex)}</span>
        );
      }
      
      setElements(newElements);
    };
    
    processEntityReferences();
    
    return () => {
      isMounted = false;
    };
  }, [content, messageId]);
  
  return <div className="whitespace-pre-line text-sm md:text-base">{elements}</div>;
});

MessageContent.displayName = "MessageContent";

// Format time in a consistent way for server and client
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export default function ChatbotPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Привет! Я корпоративный бот. Чем могу помочь?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  
  // State for entity popups
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  
  // Use client-side only rendering for timestamps to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false)
  
  // Setup event listeners for entity dialogs
  useEffect(() => {
    setIsClient(true);
    
    const handleShowEmployee = (event: Event) => {
      if ('detail' in event && event.detail?.employee) {
        setSelectedEmployee(event.detail.employee);
        setEmployeeDialogOpen(true);
      }
    };
    
    const handleShowEvent = (event: Event) => {
      if ('detail' in event && event.detail?.event) {
        setSelectedEvent(event.detail.event);
        setEventDialogOpen(true);
      }
    };
    
    window.addEventListener('showEmployeeDialog', handleShowEmployee as any);
    window.addEventListener('showEventDialog', handleShowEvent as any);
    
    return () => {
      window.removeEventListener('showEmployeeDialog', handleShowEmployee as any);
      window.removeEventListener('showEventDialog', handleShowEvent as any);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    try {
      // Simple POST request to local API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.message || "Извините, не удалось получить ответ.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-0 md:px-4 pb-16 md:pb-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Чат-бот</h1>

      <Card className="mb-4">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4 mb-4 h-[50vh] md:h-[60vh] overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex gap-2 md:gap-3 max-w-[90%] md:max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                    <AvatarFallback className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                      {message.role === "user" ? (
                        <User className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <Bot className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg px-3 py-2 md:px-4 md:py-2 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" 
                      ? <MessageContent content={message.content} messageId={message.id} />
                      : <div className="whitespace-pre-line text-sm md:text-base">{message.content}</div>
                    }
                    {/* Only render time on client-side to prevent hydration mismatch */}
                    {isClient && (
                      <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Введите сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              disabled={isProcessing}
              className="text-sm md:text-base"
            />
            <Button onClick={handleSendMessage} disabled={isProcessing} className="flex items-center justify-center">
              <Send className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Отправить</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Dialog using UserCard component */}
      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEmployee?.name}</DialogTitle>
          </DialogHeader>
          {selectedEmployee && <UserCard employee={selectedEmployee} variant="dialog" />}
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && <EventCard event={selectedEvent} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
