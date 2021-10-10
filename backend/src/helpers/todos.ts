import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

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
    itemId: string
): Promise<void> {
    return await todosAccess.deleteTodoForUser(userId, itemId);
}

export async function createAttachmentPresignedUrl(
    userId: string,
    itemId: string
): Promise<string> {
    return await attachmentUtils.createAttachmentPresignedUrl(userId, itemId);
}