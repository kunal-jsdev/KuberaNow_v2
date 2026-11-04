export const MARKET_TITLE =
  'Stock Market News Today, Nifty, Sensex & Shares Updates KuberaNow';

export const MARKET_DESCRIPTION =
  'Get the latest stock market news, Nifty and Sensex updates, market trends, share market insights and analysis from India and global markets.';

export const MARKET_KEYWORDS = [
  'stock market news',
  'stock market today',
  'share market news',
  'Nifty',
  'Sensex',
  'market updates',
  'Indian stock market',
];

export const MARKET_H1 = 'Stock Market News, Today, Nifty & Sensex & Updates';

export interface MarketWidgetConfig {
  id: string;
  title: string;
  contentScript: string;
}

export const MARKET_WIDGET_BLOCKS: MarketWidgetConfig[] = [
  {
    id: 'ticker-tape',
    title: 'Market Updates',
    contentScript: `<script type="module" src="https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js"></script><tv-ticker-tape symbols="BSE:NSDL,BSE:SBIN,BSE:TCS,BSE:AXISBANK,BSE:RELIANCE,BSE:HDFCBANK,BSE:INFY,BSE:ICICIBANK,BSE:TATAMOTORS" theme="light"></tv-ticker-tape>`,
  },
  {
    id: 'hotlists',
    title: 'Most Active & Top Movers on BSE',
    contentScript: `<script type="module" src="https://widgets.tradingview-widget.com/w/en/tv-market-summary.js"></script><tv-market-summary exchange="BSE" show-time-range layout-mode="grid"></tv-market-summary>`,
  },
  {
    id: 'screener',
    title: 'Indian Stock Market',
    contentScript: `<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div><script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-screener.js" async>${JSON.stringify(
      {
        width: '100%',
        height: '550',
        defaultColumn: 'overview',
        defaultScreen: 'most_capitalized',
        market: 'india',
        showToolbar: true,
        colorTheme: 'light',
        locale: 'in',
        isTransparent: false,
      }
    )}</script></div>`,
  },
  {
    id: 'stock-heatmap',
    title: 'BSE Stock Heatmap',
    contentScript: `<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div><script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js" async>${JSON.stringify(
      {
        exchanges: [],
        dataSource: 'SENSEX',
        grouping: 'sector',
        blockSize: 'market_cap_basic',
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
        height: '600',
      }
    )}</script></div>`,
  },
];
