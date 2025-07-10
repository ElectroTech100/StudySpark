import { AuthRequest, AuthSessionResult, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseName: string;
  courseId: string;
  points: number;
  state: string;
}

interface Course {
  id: string;
  name: string;
  section: string;
  descriptionHeading: string;
  room: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode: string;
  courseState: string;
  alternateLink: string;
}

class GoogleClassroomService {
  private clientId = '289809395610-h5e6efjlrffapj3ueoa08duahkhq7srf.apps.googleusercontent.com';
  private redirectUri = makeRedirectUri({
    scheme: 'myapp',
    path: 'auth'
  });
  
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async authenticate(): Promise<boolean> {
    try {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly')}&` +
        `access_type=offline&` +
        `prompt=consent`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, this.redirectUri);
      
      if (result.type === 'success' && result.url) {
        const code = this.extractCodeFromUrl(result.url);
        if (code) {
          return await this.exchangeCodeForTokens(code);
        }
      }
      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  private extractCodeFromUrl(url: string): string | null {
    const match = url.match(/code=([^&]+)/);
    return match ? match[1] : null;
  }

  private async exchangeCodeForTokens(code: string): Promise<boolean> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }).toString(),
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token exchange error:', error);
      return false;
    }
  }

  async getCourses(): Promise<Course[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('https://classroom.googleapis.com/v1/courses', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data.courses || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  async getAssignments(courseId?: string): Promise<Assignment[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const courses = courseId ? [{ id: courseId }] : await this.getCourses();
      const allAssignments: Assignment[] = [];

      for (const course of courses) {
        const response = await fetch(
          `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        const courseWork = data.courseWork || [];

        const assignments = courseWork.map((work: any) => ({
          id: work.id,
          title: work.title,
          description: work.description || '',
          dueDate: work.dueDate ? this.formatDueDate(work.dueDate, work.dueTime) : '',
          courseName: course.name || 'Unknown Course',
          courseId: course.id,
          points: work.maxPoints || 100,
          state: work.state || 'PUBLISHED',
        }));

        allAssignments.push(...assignments);
      }

      return allAssignments;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  private formatDueDate(dueDate: any, dueTime?: any): string {
    try {
      const date = new Date(dueDate.year, dueDate.month - 1, dueDate.day);
      
      if (dueTime) {
        date.setHours(dueTime.hours || 23, dueTime.minutes || 59);
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }

  convertAssignmentToTask(assignment: Assignment) {
    return {
      title: assignment.title,
      subject: this.mapCourseToSubject(assignment.courseName),
      priority: this.determinePriority(assignment.dueDate),
      dueDate: assignment.dueDate,
      estimatedTime: this.estimateTime(assignment.points),
      description: assignment.description,
      source: 'google-classroom',
      sourceId: assignment.id,
      courseId: assignment.courseId,
      courseName: assignment.courseName,
    };
  }

  private mapCourseToSubject(courseName: string): string {
    const courseMap: { [key: string]: string } = {
      'math': 'Mathematics',
      'chemistry': 'Chemistry',
      'physics': 'Physics',
      'biology': 'Biology',
      'english': 'English',
      'history': 'History',
      'science': 'Chemistry',
      'literature': 'English',
      'algebra': 'Mathematics',
      'calculus': 'Mathematics',
      'geometry': 'Mathematics',
    };

    const lowerCourseName = courseName.toLowerCase();
    for (const [key, subject] of Object.entries(courseMap)) {
      if (lowerCourseName.includes(key)) {
        return subject;
      }
    }
    
    return 'Other';
  }

  private determinePriority(dueDate: string): 'low' | 'medium' | 'high' {
    if (!dueDate) return 'medium';
    
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 2) return 'high';
    if (daysUntilDue <= 7) return 'medium';
    return 'low';
  }

  private estimateTime(points: number): string {
    if (points <= 50) return '1 hour';
    if (points <= 100) return '2 hours';
    if (points <= 200) return '3 hours';
    return '4+ hours';
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async signOut(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

export default new GoogleClassroomService();