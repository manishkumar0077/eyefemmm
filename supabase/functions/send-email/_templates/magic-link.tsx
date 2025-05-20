
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Img,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: MagicLinkEmailProps) => {
  const logoUrl = "https://lovable-uploads.s3.amazonaws.com/0be54e8c-3fb6-41db-978d-c7aaedc08372.png";

  return (
    <Html>
      <Head />
      <Preview>Log in with this magic link</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img 
            src={logoUrl} 
            alt="Eyefem Healthcare Logo" 
            style={{
              maxWidth: '200px', 
              margin: '0 auto', 
              display: 'block',
              marginBottom: '20px'
            }} 
          />
          <Heading style={h1}>Login</Heading>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            target="_blank"
            style={{
              ...link,
              display: 'block',
              marginBottom: '16px',
            }}
          >
            Click here to log in with this magic link
          </Link>
          <Text style={{ ...text, marginBottom: '14px' }}>
            Or, copy and paste this temporary login code:
          </Text>
          <code style={code}>{token}</code>
          <Text
            style={{
              ...text,
              color: '#ababab',
              marginTop: '14px',
              marginBottom: '16px',
            }}
          >
            If you didn&apos;t try to login, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            <Link
              href="https://eyefem.com"
              target="_blank"
              style={{ ...link, color: '#898989' }}
            >
              Eyefem Healthcare
            </Link>
            , your trusted healthcare partner.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default MagicLinkEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '465px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'normal',
  textAlign: 'center',
  padding: '30px 0',
}

const link = {
  color: '#2754c3',
  textDecoration: 'none',
}

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
}

const code = {
  backgroundColor: '#eee',
  borderColor: '#ddd',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: '2px',
  color: '#9f6f5f',
  display: 'inline-block',
  fontFamily: 'monospace',
  fontSize: '14px',
  padding: '8px 10px',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  textAlign: 'center',
}
