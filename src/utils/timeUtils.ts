/**
 * Time utility functions for the application
 */

/**
 * Returns the current time of day as a string
 * @returns 'morning' | 'afternoon' | 'night'
 */
export const getCurrentTimeOfDay = (): 'morning' | 'afternoon' | 'night' => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 14) {
    return 'morning';
  } else if (hour >= 14 && hour < 22) {
    return 'afternoon';
  } else {
    return 'night';
  }
};

/**
 * Formats the current date in Spanish
 * @returns Formatted date string
 */
export const formatCurrentDate = (): string => {
  const today = new Date();
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  // Format date in Spanish
  return today.toLocaleDateString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase());
};

/**
 * Gets a greeting message based on time of day
 * @returns Greeting message
 */
export const getGreeting = (): string => {
  const timeOfDay = getCurrentTimeOfDay();
  
  const greetings = {
    morning: '¡Buenos días!',
    afternoon: '¡Buenas tardes!',
    night: '¡Buenas noches!'
  };
  
  return greetings[timeOfDay];
};