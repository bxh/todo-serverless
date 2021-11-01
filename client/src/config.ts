// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '...'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-bc205uyt.us.auth0.com',            // Auth0 domain
  clientId: '4n5GOiA6nO2uYYeSYNIk7pbfPmhv1a8N',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
