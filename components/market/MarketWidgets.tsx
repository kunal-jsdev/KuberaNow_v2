'use client';

import { useEffect, useRef } from 'react';

import ContentPanel from '../common/ContentPanel';
import PageSectionHeader from '../common/PageSectionHeader';

const TICKER_TAPE_SYMBOLS = [
  'BSE:ADEL1!',
  'BSE:BAJAJHFL',
  'BSE:CIPLA',
  'BSE:DIVISLAB',
  'BSE:ETERNAL',
  'BSE:HDFCBANK',
  'BSE:TITAN',
  'BSE:INDUSINDBK',
  'BSE:MARUTI',
  'BSE:NTPC',
  'BSE:SHRIRAMFIN',
  'BSE:TCS',
  'BSE:ADANIPORTS',
  'BSE:BAJAJ_AUTO',
  'BSE:HCLTECH',
  'BSE:ITC',
  'BSE:SBIN',
  'BSE:APOLLOHOSP',
  'BSE:TMCV',
  'BSE:BAJAJFINSV',
  'BSE:HEROMOTOCO',
  'BSE:SUNPHARMA',
  'BSE:TMPV',
  'BSE:ASIANPAINT',
  'BSE:BPCL',
  'BSE:HINDALCO',
  'BSE:TECHM',
  'BSE:AXISBANK',
  'BSE:BHARTIARTL',
  'BSE:BRITANNIA',
  'BSE:COALINDIA',
  'BSE:DRREDDY',
  'BSE:EICHERMOT',
  'BSE:GRASIM',
  'BSE:HDFCLIFE',
  'BSE:ICICIBANK',
  'BSE:HCL_INSYS',
  'BSE:JSWSTEEL',
  'BSE:KOTAKBANK',
  'BSE:LT',
  'BSE:M_M',
  'BSE:NESTLEIND',
  'BSE:ONGC',
  'BSE:POWERGRID',
  'BSE:RELIANCE',
  'BSE:SBILIFE',
  'BSE:TATACONSUM',
  'BSE:TATASTEEL',
  'BSE:ULTRACEMCO',
  'BSE:WIPRO',
  'BSE:HINDUNILVR',
];

const MARKET_DATA_SECTORS = [
  {
    sectionName: 'Indices',
    symbols: [
      'ICMARKETS:US500',
      'FX:US30',
      'ICMARKETS:IT40',
      'ICMARKETS:DE40',
      'ICMARKETS:STOXX50',
      'BLACKBULL:JPN225',
      'EIGHTCAP:ASX200',
    ],
  },
  {
    sectionName: 'Commodities',
    symbols: [
      'EASYMARKETS:OILUSD',
      'OANDA:XAUUSD',
      'IG:COPPER',
      'CAPITALCOM:NICKEL',
      'IG:ALUMINIUM',
      'VANTAGE:WHEAT',
    ],
  },
  {
    sectionName: 'Forex',
    symbols: [
      'FX_IDC:USDINR',
      'FX_IDC:GBPINR',
      'FX_IDC:CNYIDR',
      'FX_IDC:AUDINR',
      'FX_IDC:SGDINR',
    ],
  },
];

export function MarketTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (containerRef.current.querySelector('tv-ticker-tape')) return;

    const script = document.createElement('script');
    script.type = 'module';
    script.src =
      'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js';

    const widget = document.createElement('tv-ticker-tape') as HTMLElement;
    widget.setAttribute('symbols', TICKER_TAPE_SYMBOLS.join(','));
    widget.setAttribute('show-hover', '');
    widget.setAttribute('transparent', '');

    containerRef.current.appendChild(script);
    containerRef.current.appendChild(widget);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <ContentPanel className='flex flex-col gap-4'>
      <PageSectionHeader title='Market Updates' />
      <div
        ref={containerRef}
        className='min-h-[80px] w-full overflow-hidden'
      />
    </ContentPanel>
  );
}

export function TopGainersLosers() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (containerRef.current.querySelector('tv-market-summary')) return;

    const script = document.createElement('script');
    script.type = 'module';
    script.src =
      'https://widgets.tradingview-widget.com/w/en/tv-market-summary.js';

    const widget = document.createElement('tv-market-summary') as HTMLElement;
    widget.setAttribute('exchange', 'BSE');
    widget.setAttribute('show-time-range', '');
    widget.setAttribute('layout-mode', 'grid');

    containerRef.current.appendChild(script);
    containerRef.current.appendChild(widget);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <ContentPanel className='flex flex-col gap-4'>
      <PageSectionHeader title='Top Gainers &amp; Losers BSE' />
      <div
        ref={containerRef}
        className='min-h-[300px] w-full overflow-hidden'
      />
    </ContentPanel>
  );
}

export function GlobalMarketData() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (containerRef.current.querySelector('tv-market-data')) return;

    const script = document.createElement('script');
    script.type = 'module';
    script.src =
      'https://widgets.tradingview-widget.com/w/en/tv-market-data.js';

    const widget = document.createElement('tv-market-data') as HTMLElement;
    widget.setAttribute('symbol-sectors', JSON.stringify(MARKET_DATA_SECTORS));
    widget.setAttribute('transparent', '');

    containerRef.current.appendChild(script);
    containerRef.current.appendChild(widget);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <ContentPanel className='flex flex-col gap-4'>
      <PageSectionHeader title='Global Markets Dashboard' />
      <div
        ref={containerRef}
        className='min-h-[400px] w-full overflow-hidden'
      />
    </ContentPanel>
  );
}

export function IndianStockMarket() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    script.async = true;
    script.textContent = JSON.stringify({
      market: 'india',
      showToolbar: true,
      defaultColumn: 'overview',
      defaultScreen: 'most_capitalized',
      isTransparent: false,
      locale: 'en',
      colorTheme: 'light',
      width: '100%',
      height: 500,
    });

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <ContentPanel className='flex flex-col gap-4'>
      <PageSectionHeader title='Indian Stock Market' />
      <div className='tradingview-widget-container w-full overflow-hidden'>
        <div
          ref={containerRef}
          className='w-full'
        />
        <div className='tradingview-widget-copyright mt-1 text-xs'>
          <a
            href='https://www.tradingview.com/screener/'
            rel='noopener nofollow'
            target='_blank'
            className='text-blue-500'
          >
            Stock Screener
          </a>
          <span className='text-text-muted'> by TradingView</span>
        </div>
      </div>
    </ContentPanel>
  );
}

export function BSEStockHeatmap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
    script.async = true;
    script.textContent = JSON.stringify({
      dataSource: 'SENSEX',
      blockSize: 'market_cap_basic',
      blockColor: 'change',
      grouping: 'sector',
      locale: 'en',
      symbolUrl: '',
      colorTheme: 'light',
      exchanges: [],
      hasTopBar: true,
      isDataSetEnabled: true,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: '100%',
      height: '100%',
    });

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <ContentPanel className='flex flex-col gap-4'>
      <PageSectionHeader title='BSE Stock Heatmap' />
      <div className='tradingview-widget-container w-full overflow-hidden'>
        <div
          ref={containerRef}
          className='h-[500px] w-full'
        />
        <div className='tradingview-widget-copyright mt-1 text-xs'>
          <a
            href='https://www.tradingview.com/heatmap/stock/'
            rel='noopener nofollow'
            target='_blank'
            className='text-blue-500'
          >
            Stock Heatmap
          </a>
          <span className='text-text-muted'> by TradingView</span>
        </div>
      </div>
    </ContentPanel>
  );
}
