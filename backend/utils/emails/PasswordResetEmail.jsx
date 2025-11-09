const React = require('react');
const {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} = require('@react-email/components');

const PasswordResetEmail = ({ firstName, url }) => {
  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(
      Body,
      { style: mainStyle },
      React.createElement(
        Container,
        { style: containerStyle },
        React.createElement(
          Section,
          { style: headerStyle },
          React.createElement(Text, { style: logoStyle }, '🌍 tripBuddy'),
        ),
        React.createElement(
          Section,
          { style: contentStyle },
          React.createElement(
            Text,
            { style: titleStyle },
            'Reset Your Password',
          ),
          React.createElement(
            Text,
            { style: paragraphStyle },
            `Hi ${firstName},`,
          ),
          React.createElement(
            Text,
            { style: paragraphStyle },
            'You requested to reset your password. Click the button below to create a new password:',
          ),
          React.createElement(
            Button,
            { href: url, style: buttonStyle },
            'Reset Password',
          ),
          React.createElement(
            Text,
            { style: warningStyle },
            '⚠️ This link will expire in 10 minutes.',
          ),
          React.createElement(Hr, { style: hrStyle }),
          React.createElement(
            Text,
            { style: footerStyle },
            "If you didn't request this password reset, please ignore this email. Your password will remain unchanged.",
          ),
        ),
      ),
    ),
  );
};

// Styles
const mainStyle = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '40px 0',
};

const containerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '0',
  overflow: 'hidden',
};

const headerStyle = {
  backgroundColor: '#ef4444',
  padding: '30px 40px',
  textAlign: 'center',
};

const logoStyle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const contentStyle = {
  padding: '40px',
};

const titleStyle = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  lineHeight: '1.4',
};

const paragraphStyle = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const buttonStyle = {
  backgroundColor: '#ef4444',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
  textAlign: 'center',
  margin: '20px 0',
};

const warningStyle = {
  color: '#f59e0b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '20px 0 0',
};

const hrStyle = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const footerStyle = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '10px 0 0',
};

module.exports = PasswordResetEmail;
