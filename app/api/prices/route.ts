import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface PriceItem {
  name: string;
  price: number | null;
  store: string;
  url: string | null;
}

// In-memory cache to store results for 1 hour
const cache = new Map();

async function fetchCheckersPrices(items: string[]): Promise<PriceItem[]> {
  const results: PriceItem[] = [];
  for (const item of items) {
    try {
      const url = `https://www.checkers.co.za/search/products?q=${encodeURIComponent(item)}`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const $ = cheerio.load(data);

      // Selector for the first product item
      // This might need updating if the site structure changes.
      const productElement = $('.product-list__item').first();

      if (productElement.length) {
        const productName = productElement.find('.item-product__name').text().trim();
        const priceText = productElement.find('.item-product__price').text().trim();
        const productUrl = productElement.find('a').attr('href');

        // Extract numeric price
        const priceMatch = priceText.match(/[\d,.]+/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : null;

        results.push({
          name: productName,
          price: price,
          store: 'Checkers',
          url: productUrl ? `https://www.checkers.co.za${productUrl}` : null,
        });
      }
    } catch (error) {
      console.error(`Error fetching ${item} from Checkers:`, error);
      results.push({ name: item, price: null, store: 'Checkers', url: null });
    }
  }
  return results;
}

async function fetchShopritePrices(items: string[]): Promise<PriceItem[]> {
  const results: PriceItem[] = [];
  for (const item of items) {
    try {
      const url = `https://www.shoprite.co.za/search/products?q=${encodeURIComponent(item)}`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const $ = cheerio.load(data);

      const productElement = $('.product-list__item').first();

      if (productElement.length) {
        const productName = productElement.find('.item-product__name').text().trim();
        const priceText = productElement.find('.item-product__price').text().trim();
        const productUrl = productElement.find('a').attr('href');

        const priceMatch = priceText.match(/[\d,.]+/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : null;

        results.push({
          name: productName || item,
          price: price,
          store: 'Shoprite',
          url: productUrl ? `https://www.shoprite.co.za${productUrl}` : null,
        });
      }
    } catch (error) {
      console.error(`Error fetching ${item} from Shoprite:`, error);
      results.push({ name: item, price: null, store: 'Shoprite', url: null });
    }
  }
  return results;
}

async function fetchPicknPayPrices(items: string[]): Promise<PriceItem[]> {
  const results: PriceItem[] = [];
  for (const item of items) {
    try {
      const url = `https://www.pnp.co.za/pnpstorefront/pnp/en/search?text=${encodeURIComponent(item)}`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const $ = cheerio.load(data);

      const productElement = $('.product-grid-item').first();

      if (productElement.length) {
        const productName = productElement.find('.item-name').text().trim();
        const priceText = productElement.find('.currentPrice').text().trim();
        const productUrl = productElement.find('a').attr('href');

        const priceMatch = priceText.match(/[\d,.]+/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : null;

        results.push({
          name: productName || item,
          price: price,
          store: 'Pick n Pay',
          url: productUrl ? `https://www.pnp.co.za${productUrl}` : null,
        });
      }
    } catch (error) {
      console.error(`Error fetching ${item} from Pick n Pay:`, error);
      results.push({ name: item, price: null, store: 'Pick n Pay', url: null });
    }
  }
  return results;
}

async function fetchWoolworthsPrices(items: string[]): Promise<PriceItem[]> {
  const results: PriceItem[] = [];
  for (const item of items) {
    try {
      const url = `https://www.woolworths.co.za/cat?Ntt=${encodeURIComponent(item)}`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const $ = cheerio.load(data);

      const productElement = $('.product-list__item').first();

      if (productElement.length) {
        const productName = productElement.find('.product-card__name').text().trim();
        const priceText = productElement.find('.price').text().trim();
        const productUrl = productElement.find('a').attr('href');

        const priceMatch = priceText.match(/[\d,.]+/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : null;

        results.push({
          name: productName || item,
          price: price,
          store: 'Woolworths',
          url: productUrl ? `https://www.woolworths.co.za${productUrl}` : null,
        });
      }
    } catch (error) {
      console.error(`Error fetching ${item} from Woolworths:`, error);
      results.push({ name: item, price: null, store: 'Woolworths', url: null });
    }
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { shoppingList } = await request.json();

    if (!shoppingList || !Array.isArray(shoppingList) || shoppingList.length === 0) {
      return NextResponse.json({ error: 'Shopping list is required' }, { status: 400 });
    }

    const cacheKey = JSON.stringify(shoppingList);
    if (cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      if (cachedData.timestamp > Date.now() - 3600 * 1000) {
        return NextResponse.json(cachedData.data);
      }
    }

    const [checkersPrices, shopritePrices, picknpayPrices, woolworthsPrices] = await Promise.all([
      fetchCheckersPrices(shoppingList),
      fetchShopritePrices(shoppingList),
      fetchPicknPayPrices(shoppingList),
      fetchWoolworthsPrices(shoppingList),
    ]);

    const allPrices = [...checkersPrices, ...shopritePrices, ...picknpayPrices, ...woolworthsPrices];

    const stores = ['Checkers', 'Shoprite', 'Pick n Pay', 'Woolworths'];
    const results = stores.map(store => {
      const storeItems = allPrices.filter(item => item.store === store);
      const total = storeItems.reduce((acc, item) => acc + (item.price || 0), 0);
      return {
        store,
        total: `R${total.toFixed(2)}`,
        items: storeItems,
      };
    });

    results.sort((a, b) => {
      const priceA = parseFloat(a.total.replace('R', ''));
      const priceB = parseFloat(b.total.replace('R', ''));
      return priceA - priceB;
    });

    cache.set(cacheKey, { timestamp: Date.now(), data: results });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in /api/prices:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to fetch prices', details: errorMessage }, { status: 500 });
  }
}