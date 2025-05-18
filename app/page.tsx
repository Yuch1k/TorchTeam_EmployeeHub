import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-0 md:px-4 pb-16 md:pb-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Добро пожаловать <br />в корпоративный портал</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Чат-бот</CardTitle>
            <CardDescription>Получите информацию о мероприятиях или найдите сотрудника</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <Link href="/chatbot">
              <Button className="w-full">Перейти</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Поиск сотрудников</CardTitle>
            <CardDescription>Найдите коллег по имени или проекту</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <Link href="/employees">
              <Button className="w-full">Перейти</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Активность</CardTitle>
            <CardDescription>Ближайшие мероприятия и поиск по хобби</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <Link href="/engagement">
              <Button className="w-full">Перейти</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Календарь</CardTitle>
            <CardDescription>Календарь предстоящих активностей</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <Link href="/events">
              <Button className="w-full">Перейти</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Задачи</CardTitle>
            <CardDescription>Управление вашими задачами</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <Link href="/tasks">
              <Button className="w-full">Перейти</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
