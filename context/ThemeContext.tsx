import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  success: string;
  warning: string;
  error: string;
  inactive: string;
};

// Define theme type
export type Theme = {
  dark: boolean;
  colors: ThemeColors;
};

// Define theme context type
type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

// Define the light theme
const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2A9D8F',     // Teal
    secondary: '#264653',   // Dark blue
    background: '#FFFFFF',  // White
    card: '#F2F2F2',        // Light gray
    text: '#333333',        // Dark gray
    border: '#E0E0E0',      // Light gray border
    notification: '#FF9F1C', // Orange
    success: '#8AC926',     // Green
    warning: '#FFBF69',     // Light orange
    error: '#E76F51',       // Coral
    inactive: '#CCCCCC',    // Medium gray
  },
};

// Define the dark theme
const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#2A9D8F',     // Keep teal
    secondary: '#E9C46A',   // Yellow (for better contrast in dark mode)
    background: '#121212',  // Dark gray
    card: '#1E1E1E',        // Slightly lighter dark gray
    text: '#F2F2F2',        // Light gray
    border: '#333333',      // Dark gray border
    notification: '#FF9F1C', // Orange
    success: '#8AC926',     // Green
    warning: '#FFBF69',     // Light orange
    error: '#E76F51',       // Coral
    inactive: '#666666',    // Medium gray
  },
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  
  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for using theme context
export const useTheme = () => useContext(ThemeContext);