import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodoForUser, getTodo } from '../../helpers/todos'
import { getUserId } from '../utils'
import * as createHttpError from 'http-errors'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event);
    const item = await getTodo(todoId);
    if(item && item.userId !== userId) {
      throw createHttpError().Forbidden();
    }
    await deleteTodoForUser(todoId);
    
    return {
      statusCode: 204,
      body: ''
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
