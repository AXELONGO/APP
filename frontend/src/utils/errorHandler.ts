export interface AppError {
    message: string;
    code?: string;
    description?: string;
}

export const handleError = (error: any): AppError => {
    console.error("Centralized Error Handler:", error);

    if (typeof error === 'string') return { message: error };
    if (error instanceof Error) return { message: error.message };

    return {
        message: "Ocurrió un error inesperado",
        description: JSON.stringify(error)
    };
};
