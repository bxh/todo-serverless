import { TodosAccess } from './todosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

const todosAccess = new TodosAccess();

export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
    const todoId = uuid.v4() as string;

    return await todosAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(), 
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: createTodoRequest.attachmentUrl
    });
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {

    return await todosAccess.updateTodo(
        userId,
        todoId,
        {
            name: updateTodoRequest.name,
            dueDate: updateTodoRequest.dueDate,
            done: updateTodoRequest.done
        });
}

export async function getTodosForUser(
    userId: string,
): Promise<TodoItem[]> {
    return await todosAccess.getTodosForUser(userId);
}

export async function deleteTodoForUser(
    userId: string,
    todoId: string
): Promise<void> {
    return await todosAccess.deleteTodoForUser(userId, todoId);
}
