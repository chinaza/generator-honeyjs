import { getEnv } from '../config';
import { Http } from '../utils/fetch';

export enum MailTemplates {
  ONBOARDING = 8,
  MILESTONE_REWARD = 18
}

export enum MailTags {
  ONBOARDING = 'ONBOARDING'
}

interface BrevoParams {
  replyTo: { email: string; name?: string };
}

interface SendTransactionalEmailParams {
  to: string[];
  templateId: MailTemplates;
  subject?: string;
  params?: Record<string, any>;
  tags?: MailTags[];
}

const REPLY_TO_EMAIL = 'hello@promind.ai';
const REPLY_TO_NAME = 'Naza';

class Brevo {
  private http: Http;
  constructor(
    apiKey: string,
    private params: BrevoParams = {
      replyTo: { email: REPLY_TO_EMAIL, name: REPLY_TO_NAME }
    }
  ) {
    this.http = new Http('https://api.brevo.com/v3', { 'api-key': apiKey });
  }

  async sendTransactionalEmail({
    to,
    templateId,
    subject,
    params,
    tags
  }: SendTransactionalEmailParams) {
    await this.http.makeRequest('/smtp/email', 'POST', {
      templateId,
      to: to.map((e) => ({ email: e })),
      subject,
      replyTo: this.params.replyTo,
      params,
      tags
    });
  }
}

export default function getMailer(params?: BrevoParams) {
  const apiKey = getEnv('BREVO_API_KEY');
  return new Brevo(apiKey, params);
}
