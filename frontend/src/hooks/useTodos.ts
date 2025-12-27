import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../api';
import type { Todo, TodoType } from '../types';

export const useTodos = () => {
    const { getAccessTokenSilently } = useAuth0();

    return useQuery({
        queryKey: ['todos'],
        queryFn: async () => {
            const token = await getAccessTokenSilently();
            const response = await api.get<Todo[]>('/todos/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        },
    });
};

export const useTodoTypes = () => {
    const { getAccessTokenSilently } = useAuth0();

    return useQuery({
        queryKey: ['todoTypes'],
        queryFn: async () => {
            const token = await getAccessTokenSilently();
            const response = await api.get<TodoType[]>('/todo-types/', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        },
    });
};

export const useAddTodo = () => {
    const { getAccessTokenSilently } = useAuth0();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ title, typeId }: { title: string; typeId: number | '' }) => {
            const token = await getAccessTokenSilently();
            const payload: any = { title };
            if (typeId) {
                payload.todo_type_id = typeId;
            }
            return api.post('/todos/', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });
};

export const useToggleTodo = () => {
    const { getAccessTokenSilently } = useAuth0();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (todo: Todo) => {
            const token = await getAccessTokenSilently();
            return api.patch(`/todos/${todo.id}/`, { completed: !todo.completed }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });
};

export const useDeleteTodo = () => {
    const { getAccessTokenSilently } = useAuth0();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const token = await getAccessTokenSilently();
            return api.delete(`/todos/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });
};
