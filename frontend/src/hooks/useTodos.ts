import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import type { Todo, TodoType } from '../types';

export const useTodos = () => {
    return useQuery({
        queryKey: ['todos'],
        queryFn: async () => {
            const response = await api.get<Todo[]>('/todos/');
            return response.data;
        },
    });
};

export const useTodoTypes = () => {
    return useQuery({
        queryKey: ['todoTypes'],
        queryFn: async () => {
            const response = await api.get<TodoType[]>('/todo-types/');
            return response.data;
        },
    });
};

export const useAddTodo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ title, typeId }: { title: string; typeId: number | '' }) => {
            const payload: any = { title };
            if (typeId) {
                payload.todo_type_id = typeId;
            }
            return api.post('/todos/', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });
};

export const useToggleTodo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (todo: Todo) => {
            return api.patch(`/todos/${todo.id}/`, { completed: !todo.completed });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });
};

export const useDeleteTodo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            return api.delete(`/todos/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });
};
