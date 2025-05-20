
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

interface WelcomeEmailProps {
  supabase_url: string
  user_email: string
}

export const WelcomeEmail = ({
  supabase_url,
  user_email,
}: WelcomeEmailProps) => {
  // Update the logo URL to point to where your logo actually exists
  const logoUrl = "https://pqkhtgdmgnneooleniis.supabase.co/storage/v1/object/public/website-content/eyefem-logo.png";

  return (
    <Html>
      <Head />
      <Preview>Welcome to Eyefem Healthcare</Preview>
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
          <Heading style={h1}>Welcome to Eyefem Healthcare</Heading>
          <Text style={text}>
            Dear {user_email},
          </Text>
          <Text style={text}>
            Thank you for choosing Eyefem Healthcare. We're excited to have you on board!
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

export default WelcomeEmail

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

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  textAlign: 'center',
}
