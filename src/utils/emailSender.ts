import { SmtpConfig } from '../types/smtp';

async function sendWithRelaiSmtp(to: string, subject: string, content: string, config: SmtpConfig): Promise<void> {
  const response = await fetch('https://api.relai-smtp.com/v1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      from: {
        email: config.fromEmail,
        name: config.fromName
      },
      to: [{ email: to }],
      subject: subject,
      text: content,
      html: content.replace(/\n/g, '<br>')
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur lors de l\'envoi de l\'email' }));
    throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email');
  }
}

async function sendWithGmail(to: string, subject: string, content: string, config: SmtpConfig): Promise<void> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.gmailAppPassword}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: btoa(
        `From: ${config.fromName} <${config.fromEmail}>\r\n` +
        `To: ${to}\r\n` +
        `Subject: ${subject}\r\n` +
        `Content-Type: text/html; charset=utf-8\r\n\r\n` +
        content.replace(/\n/g, '<br>')
      ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'envoi via Gmail');
  }
}

async function sendWithOutlook(to: string, subject: string, content: string, config: SmtpConfig): Promise<void> {
  const response = await fetch('https://outlook.office.com/api/v2.0/me/sendmail', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.outlookPassword}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Message: {
        Subject: subject,
        Body: {
          ContentType: 'HTML',
          Content: content.replace(/\n/g, '<br>')
        },
        ToRecipients: [
          {
            EmailAddress: {
              Address: to
            }
          }
        ]
      },
      SaveToSentItems: true
    })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de l\'envoi via Outlook');
  }
}

export const sendEmail = async (
  to: string,
  subject: string,
  content: string,
  config: SmtpConfig
): Promise<void> => {
  if (!config.fromEmail) {
    throw new Error('Email d\'expédition requis');
  }

  try {
    switch (config.provider) {
      case 'relai':
        if (config.apiKey) {
          await sendWithRelaiSmtp(to, subject, content, config);
          return;
        }
        break;
      case 'gmail':
        if (config.gmailAppPassword) {
          await sendWithGmail(to, subject, content, config);
          return;
        }
        break;
      case 'outlook':
        if (config.outlookPassword) {
          await sendWithOutlook(to, subject, content, config);
          return;
        }
        break;
    }

    throw new Error('Configuration d\'envoi d\'email invalide');
  } catch (error) {
    throw error;
  }
};

export const testSmtpConnection = async (config: SmtpConfig): Promise<void> => {
  if (!config.fromEmail) {
    throw new Error('Email d\'expédition requis');
  }

  try {
    switch (config.provider) {
      case 'relai':
        if (config.apiKey) {
          const response = await fetch('https://api.relai-smtp.com/v1/account', {
            headers: {
              'Authorization': `Bearer ${config.apiKey}`
            }
          });
          if (response.ok) return;
        }
        break;
      case 'gmail':
        if (config.gmailAppPassword) {
          const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
            headers: {
              'Authorization': `Bearer ${config.gmailAppPassword}`
            }
          });
          if (response.ok) return;
        }
        break;
      case 'outlook':
        if (config.outlookPassword) {
          const response = await fetch('https://outlook.office.com/api/v2.0/me/messages', {
            headers: {
              'Authorization': `Bearer ${config.outlookPassword}`
            }
          });
          if (response.ok) return;
        }
        break;
    }

    throw new Error('Configuration invalide');
  } catch (error) {
    throw new Error('Impossible de vérifier la configuration. Vérifiez vos identifiants.');
  }
};