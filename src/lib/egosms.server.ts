import { welcomeChannels, welcomeText } from './welcome';

export async function sendWelcomeSms(phone: string) {
  return sendSms(phone, welcomeText);
}

export async function sendSms(phone: string, message: string) {
  if (!welcomeChannels({ phone }).sms) throw new Error('Invalid text recipient');
  if (!message.trim() || message.length > 480) throw new Error('Invalid text message');
  const username = process.env['EGOSMS_USERNAME'];
  const password = process.env['EGOSMS_PASSWORD'];
  const senderid = process.env['EGOSMS_SENDER_ID'];
  if (!username || !password || !senderid) throw new Error('EgoSMS is not configured');
  const response = await fetch('https://comms.egosms.co/api/v1/json/', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: 'SendSms', userdata: { username, password }, msgdata: [{ number: phone.slice(1), message, senderid, priority: 1 }] }),
    signal: AbortSignal.timeout(15000),
  });
  // Provider bodies may echo userdata: never log or return their raw contents.
  if (!response.ok) throw new Error(`EgoSMS request failed [${response.status}]`);
  const result = await response.json() as { Status?: string };
  if (result.Status !== 'OK') throw new Error('EgoSMS did not accept the text; check the account balance and approved sender');
}