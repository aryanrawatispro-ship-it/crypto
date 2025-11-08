export interface DetectedAsset {
  symbol: string;
  type: 'crypto' | 'stock' | 'index';
  name?: string;
}

const CRYPTO_KEYWORDS: Record<string, string> = {
  bitcoin: 'BTC',
  btc: 'BTC',
  ethereum: 'ETH',
  eth: 'ETH',
  solana: 'SOL',
  sol: 'SOL',
  cardano: 'ADA',
  ada: 'ADA',
  polygon: 'MATIC',
  matic: 'MATIC',
  avalanche: 'AVAX',
  avax: 'AVAX',
  chainlink: 'LINK',
  link: 'LINK',
  uniswap: 'UNI',
  uni: 'UNI',
  polkadot: 'DOT',
  dot: 'DOT',
  cosmos: 'ATOM',
  atom: 'ATOM',
};

const STOCK_KEYWORDS: Record<string, string> = {
  apple: 'AAPL',
  aapl: 'AAPL',
  google: 'GOOGL',
  googl: 'GOOGL',
  microsoft: 'MSFT',
  msft: 'MSFT',
  tesla: 'TSLA',
  tsla: 'TSLA',
  nvidia: 'NVDA',
  nvda: 'NVDA',
  meta: 'META',
  facebook: 'META',
  amazon: 'AMZN',
  amzn: 'AMZN',
  'sp500': 'SPY',
  's&p500': 'SPY',
  spy: 'SPY',
  nasdaq: 'QQQ',
  qqq: 'QQQ',
};

export function detectAssets(message: string): DetectedAsset[] {
  const detected: DetectedAsset[] = [];
  const messageLower = message.toLowerCase();
  const seen = new Set<string>();

  // Detect crypto
  for (const [keyword, symbol] of Object.entries(CRYPTO_KEYWORDS)) {
    if (messageLower.includes(keyword) && !seen.has(symbol)) {
      detected.push({ symbol, type: 'crypto', name: keyword });
      seen.add(symbol);
    }
  }

  // Detect stocks
  for (const [keyword, symbol] of Object.entries(STOCK_KEYWORDS)) {
    if (messageLower.includes(keyword) && !seen.has(symbol)) {
      detected.push({ symbol, type: 'stock', name: keyword });
      seen.add(symbol);
    }
  }

  return detected;
}
