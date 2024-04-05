export enum ModelMap {
  'SIMPLE' = 'GPT-3.5-TURBO',
  'COMPLEX' = 'GPT-4'
}

export const credentialTypes = {
  OPENAI: 'OPENAI'
};

export enum PayMethod {
  'OPENAI_KEY' = 'OPENAI_KEY',
  'PROMIND_TOKENS' = 'PROMIND_TOKENS'
}

export enum UserPaymentType {
  'LIFETIME' = 'LIFETIME',
  'SUBSCRIPTION' = 'SUBSCRIPTION',
  'PAYG' = 'PAYG'
}

export enum StorageProviders {
  'S3' = 'S3'
}

export enum OutputType {
  'text' = 'text',
  'photo' = 'photo'
}

export enum AlternativeModels {
  CLAUDE_HAIKU = 'CLAUDE_HAIKU',
  MISTRAL = 'MISTRAL'
}
