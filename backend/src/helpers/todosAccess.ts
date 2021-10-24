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
        logger.info(`Created todo for ${item.userId}`);

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

        logger.info(`Updated todo ${todoId} for ${userId}`);

        return result.$response.data as TodoItem;
    }

    async updateTodoWithAttachment(userId: string, todoId: string, attachmentUrl: string ): Promise<TodoItem> {
        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
              ':attachmentUrl': attachmentUrl
            },
            ReturnValues: "ALL_NEW"
          }).promise();
          
        logger.info(`Updated todo ${todoId} for ${userId} with attachment ${attachmentUrl}.`);

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

        logger.info(`Fetched todos for ${userId}`);

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

        logger.info(`Deleted todo ${itemId} for ${userId}`);
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