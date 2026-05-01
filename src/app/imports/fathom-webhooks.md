Getting started
Webhooks
Automatically trigger webhook events after your meetings

​
About Webhooks in Fathom
Webhooks will send your meeting data (optionally including the summary, transcript, and action items) to a URL of your choice.
Webhooks can be set to fire after your own meetings and/or meetings that have been shared with you. Configure these triggers in your Settings, or when generating a webhook via API.
​
Create a webhook
There are two ways to create a webhook:
​
Option 1 - in Settings
Webhooks can be configured in the API Access section of your User Settings.
How to create a webhook in Settings:
Generate an API key, then go to Manage > Add Webhook
Enter a Destination URL
Select which new recordings should trigger webhooks
Select what data to include in the payload
Go to Settings
​
Option 2 - via API
You also have the option of creating and deleting webhooks with an API call.
API docs: Create a webhook.
Be sure the check the response body to confirm the webhook was created as expected. Webhooks created via API will also appear in your Settings.
​
Test Your Webhook
To ensure your webhook is working as expected, you can record a brief, 2-minute meeting. Shortly after the meeting ends, your Destination URL should receive a webhook event.
For details on the webhook’s payload, see our API docs.
Coming soon: send a test payload from your Settings page
​
Verifying Webhooks
Webhook verification helps ensure that incoming requests to your endpoint are from Fathom and haven’t been altered.
Each webhook request sent from Fathom includes a signature in the request headers, which you can use to confirm the authenticity of the payload.
To test webhooks locally or during development, you can skip verification—but don’t forget to add it back in before going live.
​
How to verify a webhook
​
Method 1 - SDK
If you’re using our SDK, you can use the verify_webhook helper. Simply call:

Typescript

Python
Fathom.verifyWebhook(webhook_secret, request.headers, request.body)
webhook_secret – Provided when you create the webhook (either in Settings or via the API).
request.headers – The HTTP headers from the incoming request, which include the signature Fathom sends.
request.body – The raw string body of the POST request.
​
Method 2 - Without the SDK
You can also verify incoming webhooks yourself using basic tools available in most programming languages.
Every webhook payload from Fathom includes three headers used for verification:
webhook-id – The unique message identifier for the webhook message
webhook-timestamp – Timestamp in seconds since epoch
webhook-signature – The Base64 encoded list of signatures (space delimited), each prefixed with a version identifier
To verify the request:
Extract the webhook-id, webhook-timestamp, and webhook-signature from the request headers
Construct the signed content by concatenating the id, timestamp, and raw body, separated by periods: ${id}.${timestamp}.${body} (be sure to use the raw body, before any JSON parsing)
Base64 decode the portion of your webhook_secret after the whsec_ prefix (e.g., if your secret is whsec_5WbX5kEWLlfzsGNjH64I8lOOqUB6e8FH, use 5WbX5kEWLlfzsGNjH64I8lOOqUB6e8FH)
Use the decoded secret to HMAC the signed content with SHA-256, then Base64-encode the result
Extract all signatures from the webhook-signature header (remove version prefixes like v1, before comparing)
Compare your calculated signature to each provided signature using a constant-time comparison method
Verify the timestamp is within your acceptable tolerance (typically 5 minutes) to prevent replay attacks
If any signature matches and the timestamp is valid, the webhook is authentic
Example:

TypeScript

Python
const crypto = require('crypto')

function verifyWebhook(secret, headers, rawBody) {
  const webhookId = headers['webhook-id']
  const webhookTimestamp = headers['webhook-timestamp']
  const webhookSignature = headers['webhook-signature']

  // Verify timestamp (within 5 minutes)
  const timestamp = parseInt(webhookTimestamp, 10)
  const currentTimestamp = Math.floor(Date.now() / 1000)
  if (Math.abs(currentTimestamp - timestamp) > 300) {
    return false
  }

  // Construct signed content
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`

  // Base64 decode the secret (part after whsec_)
  const secretBytes = Buffer.from(secret.split('_')[1], 'base64')

  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64')

  // Extract signatures from header (remove version prefixes)
  const signatures = webhookSignature.split(' ').map(sig => {
    const parts = sig.split(',')
    return parts.length > 1 ? parts[1] : parts[0]
  })

  // Constant-time comparison
  return signatures.some(sig =>
    crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(sig)
    )
  )
}
Quickstart
