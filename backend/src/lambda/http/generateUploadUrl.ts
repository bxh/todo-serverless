import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import * as uuid from 'uuid'

import { createAttachmentPresignedUrl } from '../../helpers/attachmentUtils'
import { getTodo, updateAttachmentUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import * as createHttpError from 'http-errors'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    const attachmentId =  uuid.v4() as string;

    const url = createAttachmentPresignedUrl(attachmentId);

    const item = await getTodo(todoId);
    if(!item) {
      throw new createHttpError.Forbidden();
    }
    if(item.userId !== userId) {
      throw new createHttpError.Forbidden();
    }
    await updateAttachmentUrl(todoId, attachmentId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
