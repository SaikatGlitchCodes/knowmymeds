export const calculateDaysBetween = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  export const calculateCompletionPercentage = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    // If treatment hasn't started yet
    if (now < start) {
      return 0;
    }
    
    // If treatment has ended
    if (now > end) {
      return 100;
    }
    
    // Calculate the percentage of treatment completed
    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = now.getTime() - start.getTime();
    const percentage = (elapsedDuration / totalDuration) * 100;
    
    // Ensure percentage is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(percentage)));
  };