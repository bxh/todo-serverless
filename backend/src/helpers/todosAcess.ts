import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) {}

    async createTodo(item: TodoItem): Promise<TodoItem> {
        const result = await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise();

        return result.$response.data as TodoItem;
    }

    async updateTodo(userId: string, todoId: string, item: UpdateTodoRequest ): Promise<TodoItem> {
        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set name = :n, done = :d, dueDate = :dd",
            ExpressionAttributeValues: {
                ":n": item.name,
                ":d": item.done,
                ":dd": item.dueDate
            },
            ReturnValues: "ALL_NEW"
        }).promise();

        return result.$response.data as TodoItem;
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items as TodoItem[];
    }

    async deleteTodoForUser(userId: string, itemId: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "itemId": itemId
            }
        }).promise();
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }