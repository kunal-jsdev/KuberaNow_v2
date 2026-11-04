import type { MarketWidgetConfig } from '@/constants/marketPage';

export const CRYPTO_TITLE =
  'Cryptocurrency News Today, Bitcoin, Ethereum & Crypto Market Updates KuberaNow';

export const CRYPTO_DESCRIPTION =
  'Get the latest cryptocurrency news, live crypto prices, Bitcoin, Ethereum, Altcoins trends, market analysis, and blockchain updates.';

export const CRYPTO_KEYWORDS = [
  'cryptocurrency news',
  'crypto prices today',
  'bitcoin price',
  'ethereum news',
  'crypto market',
  'altcoins',
  'blockchain news',
  'crypto trading',
  'crypto market cap',
  'solana',
  'binance',
];

export const CRYPTO_H1 =
  'Cryptocurrency News Today, Bitcoin, Ethereum & Market Updates';

export const CRYPTO_WIDGET_BLOCKS: MarketWidgetConfig[] = [
  {
    id: 'crypto-ticker-tape',
    title: 'Cryptocurrency Market Overview',
    contentScript: `<script type="module" src="https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js"></script><tv-ticker-tape symbols="BINANCE:BTCUSDT,BINANCE:ETHUSDT,BINANCE:SOLUSDT,BINANCE:BNBUSDT,BINANCE:XRPUSDT,BINANCE:DOGEUSDT,BINANCE:ADAUSDT,BINANCE:AVAXUSDT,BINANCE:LINKUSDT,BINANCE:SUIUSDT,BINANCE:NEARUSDT,BINANCE:DOTUSDT" theme="light"></tv-ticker-tape>`,
  },
  {
    id: 'crypto-market-summary',
    title: 'Crypto Gainers, Losers & Active Coins',
    contentScript: `<script type="module" src="https://widgets.tradingview-widget.com/w/en/tv-market-summary.js"></script> <tv-market-summary layout-mode="grid" assets-type="crypto"></tv-market-summary>`,
  },
  {
    id: 'crypto-screener',
    title: 'Crypto Prices & Performance',
    contentScript: `<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div><script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-screener.js" async>${JSON.stringify(
      {
        width: '100%',
        height: 550,
        defaultColumn: 'overview',
        screener_type: 'crypto_mkt',
        displayCurrency: 'USD',
        colorTheme: 'light',
        locale: 'in',
        isTransparent: false,
      }
    )}</script></div>`,
  },
  {
    id: 'crypto-heatmap',
    title: 'Cryptocurrency Heatmap',
    contentScript: `<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div><script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js" async>${JSON.stringify(
      {
        dataSource: 'Crypto',
        blockSize: 'market_cap_calc',
        blockColor: 'change',
        locale: 'in',
        symbolUrl: '',
        colorTheme: 'light',
        hasTopBar: true,
        isDataSetEnabled: true,
        isZoomEnabled: true,
        hasSymbolTooltip: true,
        isMonoSize: false,
        width: '100%',
        height: 600,
      }
    )}</script></div>`,
  },
];
