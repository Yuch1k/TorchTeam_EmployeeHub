import { NextResponse } from 'next/server';
import { searchEmployees } from '@/lib/data/employees';
import { getEvents, searchEvents } from '@/lib/data/events';
import { getTasks } from '@/lib/data/tasks';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Always include one user ID and one event ID in the response (for testing)
    const responseMessage = 'Вот информация, которую вы запрашивали: сотрудник <u:1> и предстоящее мероприятие <e:2>';

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}