export const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    // Could eventually send to a logging service like Sentry
    return error.message || 'An unexpected error occurred';
};
