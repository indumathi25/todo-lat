import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '../components/LogoutButton';
import { useTodos, useTodoTypes, useAddTodo, useToggleTodo, useDeleteTodo } from '../hooks/useTodos';

const TodoList = () => {
    const { user } = useAuth0();
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');

    const { data: todos, isLoading: isLoadingTodos, error: errorTodos } = useTodos();
    const { data: todoTypes } = useTodoTypes();

    const addTodoMutation = useAddTodo();
    const toggleTodoMutation = useToggleTodo();
    const deleteTodoMutation = useDeleteTodo();

    const handleAddTodo = () => {
        addTodoMutation.mutate(
            { title: newTodoTitle, typeId: selectedTypeId },
            {
                onSuccess: () => {
                    setNewTodoTitle('');
                    setSelectedTypeId('');
                },
            }
        );
    };

    if (isLoadingTodos) return <div className="text-center mt-10">Loading...</div>;
    if (errorTodos) return <div className="text-center mt-10 text-red-500">Error loading todos</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Todo List</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{user?.name}</span>
                        <LogoutButton />
                    </div>
                </div>

                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTodoTitle}
                            onChange={(e) => setNewTodoTitle(e.target.value)}
                            placeholder="Add a new todo..."
                            className="cursor-pointer flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && newTodoTitle && handleAddTodo()}
                        />
                        <button
                            onClick={() => newTodoTitle && handleAddTodo()}
                            disabled={addTodoMutation.isPending}
                            className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                    <select
                        value={selectedTypeId}
                        onChange={(e) => setSelectedTypeId(Number(e.target.value) || '')}
                        className="cursor-pointer border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    >
                        <option value="">Select Type (Optional)</option>
                        {todoTypes?.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <ul className="space-y-3">
                    {todos?.map((todo) => (
                        <li key={todo.id} className="flex items-center justify-between bg-gray-50 p-4 rounded hover:bg-gray-100 transition">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleTodoMutation.mutate(todo)}
                                    className="cursor-pointer h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <div className="flex flex-col">
                                    <span className={`${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                        {todo.title}
                                    </span>
                                    {todo.todo_type && (
                                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full w-fit">
                                            {todo.todo_type.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => deleteTodoMutation.mutate(todo.id)}
                                className="cursor-pointer text-red-500 hover:text-red-700"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TodoList;
