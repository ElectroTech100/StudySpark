import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';

interface User {
  id: string;
  fullName: string;
  email: string;
  age: number;
  grade: string;
  subjects: string[];
  points: number;
  level: number;
  streak: number;
  totalStudyTime: number;
  tasksCompleted: number;
  focusSessions: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (userData: Omit<User, 'id' | 'points' | 'level' | 'streak' | 'totalStudyTime' | 'tasksCompleted' | 'focusSessions'>) => Promise<boolean>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Mock user database
const mockUsers = [
  {
    id: '1',
    email: 'demo@studysync.com',
    password: 'password123',
    fullName: 'Demo User',
    age: 16,
    grade: '11th Grade',
    subjects: ['Mathematics', 'Chemistry'],
    points: 1250,
    level: 3,
    streak: 5,
    totalStudyTime: 25,
    tasksCompleted: 12,
    focusSessions: 18,
  },
  {
    id: '2',
    email: 'sarah@example.com',
    password: 'sarah123',
    fullName: 'Sarah Johnson',
    age: 17,
    grade: '12th Grade',
    subjects: ['Physics', 'Mathematics', 'Chemistry'],
    points: 2100,
    level: 4,
    streak: 12,
    totalStudyTime: 45,
    tasksCompleted: 28,
    focusSessions: 35,
  },
  {
    id: '3',
    email: 'mike@example.com',
    password: 'mike123',
    fullName: 'Mike Rodriguez',
    age: 16,
    grade: '11th Grade',
    subjects: ['Biology', 'Chemistry'],
    points: 890,
    level: 2,
    streak: 3,
    totalStudyTime: 18,
    tasksCompleted: 8,
    focusSessions: 12,
  },
  {
    id: '4',
    email: 'emma@example.com',
    password: 'emma123',
    fullName: 'Emma Wilson',
    age: 15,
    grade: '10th Grade',
    subjects: ['English', 'History'],
    points: 1680,
    level: 3,
    streak: 8,
    totalStudyTime: 32,
    tasksCompleted: 19,
    focusSessions: 24,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('studysync_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        
        // Save to localStorage
        localStorage.setItem('studysync_user', JSON.stringify(userWithoutPassword));
        
        router.replace('/(tabs)');
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const signUp = async (userData: Omit<User, 'id' | 'points' | 'level' | 'streak' | 'totalStudyTime' | 'tasksCompleted' | 'focusSessions'>): Promise<boolean> => {
    try {
      // Check if email already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        return false;
      }

      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        points: 0,
        level: 1,
        streak: 0,
        totalStudyTime: 0,
        tasksCompleted: 0,
        focusSessions: 0,
      };
      
      // Add to mock database
      mockUsers.push({ ...newUser, password: 'newuser123' } as any);
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('studysync_user', JSON.stringify(newUser));
      
      router.replace('/(tabs)');
      return true;
    } catch (error) {
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('studysync_user');
    router.replace('/auth');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      
      // Update level based on points
      const newLevel = Math.floor(updatedUser.points / 1000) + 1;
      updatedUser.level = newLevel;
      
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('studysync_user', JSON.stringify(updatedUser));
      
      // Update mock database
      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...updatedUser, password: mockUsers[userIndex].password } as any;
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export mock users for leaderboard
export { mockUsers };