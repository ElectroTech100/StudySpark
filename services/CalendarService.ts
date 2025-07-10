import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

interface CalendarEvent {
  id?: string;
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  location?: string;
  allDay?: boolean;
}

interface TaskEvent {
  title: string;
  dueDate: string;
  subject: string;
  estimatedTime: string;
  priority: 'low' | 'medium' | 'high';
}

class CalendarService {
  private defaultCalendarId: string | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Calendar permission error:', error);
      return false;
    }
  }

  async getDefaultCalendar(): Promise<string | null> {
    try {
      if (this.defaultCalendarId) {
        return this.defaultCalendarId;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Find the default calendar or create one
      let defaultCalendar = calendars.find(cal => 
        cal.title === 'StudySync' || 
        cal.isPrimary || 
        cal.allowsModifications
      );

      if (!defaultCalendar) {
        // Create a new calendar for StudySync
        const defaultCalendarSource = Platform.OS === 'ios'
          ? await Calendar.getDefaultCalendarSource()
          : { isLocalAccount: true, name: 'StudySync Calendar' };

        if (defaultCalendarSource) {
          this.defaultCalendarId = await Calendar.createCalendarAsync({
            title: 'StudySync',
            color: '#8B5CF6',
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: defaultCalendarSource.id,
            source: defaultCalendarSource,
            name: 'StudySync',
            ownerAccount: 'personal',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
          });
        }
      } else {
        this.defaultCalendarId = defaultCalendar.id;
      }

      return this.defaultCalendarId;
    } catch (error) {
      console.error('Error getting default calendar:', error);
      return null;
    }
  }

  async addTaskToCalendar(task: TaskEvent): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permission denied');
      }

      const calendarId = await this.getDefaultCalendar();
      if (!calendarId) {
        throw new Error('No calendar available');
      }

      const dueDate = new Date(task.dueDate);
      const estimatedHours = this.parseEstimatedTime(task.estimatedTime);
      
      // Create the main task event
      const startDate = new Date(dueDate);
      startDate.setHours(dueDate.getHours() - estimatedHours, 0, 0, 0);
      
      const eventDetails: Calendar.Event = {
        title: `📚 ${task.title}`,
        startDate: startDate,
        endDate: dueDate,
        notes: `Subject: ${task.subject}\nPriority: ${task.priority.toUpperCase()}\nEstimated Time: ${task.estimatedTime}\n\nCreated by StudySync`,
        calendarId: calendarId,
        timeZone: 'GMT',
      };

      const eventId = await Calendar.createEventAsync(calendarId, eventDetails);

      // Add a reminder notification 1 day before
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(9, 0, 0, 0); // 9 AM reminder

      const reminderEvent: Calendar.Event = {
        title: `⏰ Reminder: ${task.title} due tomorrow`,
        startDate: reminderDate,
        endDate: new Date(reminderDate.getTime() + 15 * 60 * 1000), // 15 minutes
        notes: `Don't forget! ${task.title} is due tomorrow.\nSubject: ${task.subject}\nPriority: ${task.priority.toUpperCase()}`,
        calendarId: calendarId,
        timeZone: 'GMT',
      };

      await Calendar.createEventAsync(calendarId, reminderEvent);

      return eventId;
    } catch (error) {
      console.error('Error adding task to calendar:', error);
      return null;
    }
  }

  async addStudySessionToCalendar(
    title: string, 
    startTime: Date, 
    duration: number, 
    subject: string
  ): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permission denied');
      }

      const calendarId = await this.getDefaultCalendar();
      if (!calendarId) {
        throw new Error('No calendar available');
      }

      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      const eventDetails: Calendar.Event = {
        title: `🎯 ${title}`,
        startDate: startTime,
        endDate: endTime,
        notes: `Focus Session\nSubject: ${subject}\nDuration: ${duration} minutes\n\nCreated by StudySync`,
        calendarId: calendarId,
        timeZone: 'GMT',
      };

      return await Calendar.createEventAsync(calendarId, eventDetails);
    } catch (error) {
      console.error('Error adding study session to calendar:', error);
      return null;
    }
  }

  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return [];
      }

      const calendarId = await this.getDefaultCalendar();
      if (!calendarId) {
        return [];
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const events = await Calendar.getEventsAsync([calendarId], startDate, endDate);
      
      return events.map(event => ({
        id: event.id,
        title: event.title,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        notes: event.notes,
        location: event.location,
        allDay: event.allDay,
      }));
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }

  async syncTasksToCalendar(tasks: TaskEvent[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const task of tasks) {
      try {
        const eventId = await this.addTaskToCalendar(task);
        if (eventId) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to sync task: ${task.title}`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  private parseEstimatedTime(timeString: string): number {
    const match = timeString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 2; // Default to 2 hours
  }

  async removeEvent(eventId: string): Promise<boolean> {
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error removing event:', error);
      return false;
    }
  }
}

export default new CalendarService();