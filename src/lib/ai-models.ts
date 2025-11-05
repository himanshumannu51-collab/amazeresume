/**
 * Simplified AI Model Management (OpenAI + OpenRouter Only)
 */

import { ServiceName } from './types'

// ========================
// Type Definitions
// ========================

export interface AIProvider {
  id: ServiceName
  name: string
  apiLink: string
  logo?: string
  envKey: string
  sdkInitializer: string
  unstable?: boolean
}

export interface AIModel {
  id: string
  name: string
  provider: ServiceName
  features: {
    isFree?: boolean
    isRecommended?: boolean
    isUnstable?: boolean
    maxTokens?: number
    supportsVision?: boolean
    supportsTools?: boolean
    isPro?: boolean
  }
  availability: {
    requiresApiKey: boolean
    requiresPro: boolean
  }
}

export interface ApiKey {
  service: ServiceName
  key: string
  addedAt: string
}

export interface AIConfig {
  model: string
  apiKeys: ApiKey[]
}

export interface GroupedModels {
  provider: ServiceName
  name: string
  models: AIModel[]
}

// ========================
// Provider Configurations
// ========================

export const PROVIDERS: Partial<Record<ServiceName, AIProvider>> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    apiLink: 'https://platform.openai.com/api-keys',
    logo: '/logos/chat-gpt-logo.png',
    envKey: 'OPENAI_API_KEY',
    sdkInitializer: 'openai',
    unstable: false
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    apiLink: 'https://openrouter.ai/account/api-keys',
    logo: '/logos/openrouter.png',
    envKey: 'OPENROUTER_API_KEY',
    sdkInitializer: 'openrouter',
    unstable: false
  }
}

// ========================
// Model Definitions
// ========================

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    features: {
      isRecommended: true,
      maxTokens: 400000,
      supportsVision: true,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'gpt-4.1',
    name: 'GPT 4.1',
    provider: 'openai',
    features: {
      maxTokens: 128000,
      supportsVision: true,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT 4.1 Nano',
    provider: 'openai',
    features: {
      isFree: true,
      maxTokens: 128000,
      supportsTools: true
    },
    availability: {
      requiresApiKey: false,
      requiresPro: false
    }
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    features: {
      isRecommended: true,
      maxTokens: 128000,
      supportsVision: true,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'openai/gpt-oss-120b:nitro',
    name: 'GPT OSS 120B',
    provider: 'openai',
    features: {
      isRecommended: true,
      maxTokens: 128000,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    },
  },
  {
    id: 'openai/gpt-oss-20b:nitro',
    name: 'GPT OSS 20B',
    provider: 'openai',
    features: {
      maxTokens: 128000,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    },
  },
]

// ========================
// Defaults
// ========================

export const DEFAULT_MODELS = {
  PRO_USER: 'gpt-5',
  FREE_USER: 'gpt-4.1-nano'
} as const

export const MODEL_DESIGNATIONS = {
  FAST_CHEAP: 'openai/gpt-oss-20b:nitro',
  FAST_CHEAP_FREE: 'gpt-4.1-nano',
  FRONTIER: 'gpt-5',
  FRONTIER_ALT: 'gpt-4o',
  BALANCED: 'openai/gpt-oss-120b:nitro',
  VISION: 'gpt-4o',
  DEFAULT_PRO: 'gpt-5',
  DEFAULT_FREE: 'gpt-4.1-nano'
} as const

// ========================
// Utility Functions
// ========================

export function getProvidersArray(): AIProvider[] {
  return Object.values(PROVIDERS)
}

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id)
}

export function getProviderById(id: ServiceName): AIProvider | undefined {
  return PROVIDERS[id]
}

export function getModelsByProvider(provider: ServiceName): AIModel[] {
  return AI_MODELS.filter(model => model.provider === provider)
}

export function isModelAvailable(
  modelId: string,
  isPro: boolean,
  apiKeys: ApiKey[]
): boolean {
  if (isPro) return true
  const model = getModelById(modelId)
  if (!model) return false
  if (model.features.isFree) return true
  return apiKeys.some(key => key.service === model.provider)
}

export function getDefaultModel(isPro: boolean): string {
  return isPro ? DEFAULT_MODELS.PRO_USER : DEFAULT_MODELS.FREE_USER
}

export function getModelProvider(modelId: string): AIProvider | undefined {
  const model = getModelById(modelId)
  if (!model) return undefined
  return getProviderById(model.provider)
}

export function groupModelsByProvider(): GroupedModels[] {
  const providerOrder: ServiceName[] = ['openai', 'openrouter']
  return providerOrder
    .map(providerId => {
      const provider = getProviderById(providerId)
      if (!provider) return null
      return {
        provider: providerId,
        name: provider.name,
        models: getModelsByProvider(providerId)
      }
    })
    .filter((g): g is GroupedModels => g !== null && g.models.length > 0)
}

export function getSelectableModels(isPro: boolean, apiKeys: ApiKey[]): AIModel[] {
  return AI_MODELS.filter(model => isModelAvailable(model.id, isPro, apiKeys))
}

export function getModelSDKConfig(modelId: string): { provider: AIProvider; modelId: string } | undefined {
  const model = getModelById(modelId)
  if (!model) return undefined
  const provider = getProviderById(model.provider)
  if (!provider) return undefined
  return { provider, modelId }
}
