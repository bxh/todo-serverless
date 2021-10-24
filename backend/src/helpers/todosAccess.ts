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
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosByUserIndex = process.env.TODOS_BY_USER_INDEX,
        private readonly bucketName = process.env.Attachment_BUCKET_NAME
    ) {}

    async createTodo(item: TodoItem): Promise<TodoItem> {
        const result = await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise();
        logger.info(`Created todo for ${item.userId} in ${this.todosTable}`);

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

        logger.info(`Updated todo ${todoId} for ${userId} in ${this.todosTable}.`);

        return result.$response.data as TodoItem;
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosByUserIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        logger.info(`Fetched todos for ${userId} in ${this.todosTable}.`);

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

    async updateAttachmentUrl(todoId: string, attachmentId: string) {
        logger.info(`Updating attachment URL for todo ${todoId} in ${this.todosTable}.`)
    
        await this.docClient.update({
          TableName: this.todosTable,
          Key: {
            todoId
          },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`
          }
        }).promise()
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