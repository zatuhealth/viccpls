import { Body, Container, Head, Heading, Html, Preview, Text, Link } from '@react-email/components';
import type { TemplateEntry } from './registry';

function Email() {
  return <Html><Head /><Preview>Your family account is ready</Preview><Body><Container><Heading>Welcome to ZatuHealth</Heading><Text>Your family account is ready.</Text><Text>Keep your family's vaccine records and clinic visits together.</Text><Link href="https://zatuhealth.com/app">Open ZatuHealth</Link></Container></Body></Html>;
}
export const template = { component: Email, subject: 'Welcome to ZatuHealth', displayName: 'Family welcome', previewData: {} } satisfies TemplateEntry;