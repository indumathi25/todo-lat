export interface TodoType {
    id: number;
    name: string;
    description: string;
}

export interface Todo {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    todo_type: TodoType | null;
}
