'use client';

import { useState, useMemo } from 'react';

interface PriceItem {
  name: string;
  price: number | null;
  url: string | null;
}

interface StoreResult {
  store: string;
  total: string;
  items: PriceItem[];
}

export default function PriceComparator() {
  const [shoppingList, setShoppingList] = useState('');
  const [results, setResults] = useState<StoreResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cheapestStore = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((cheapest, current) => {
      const cheapestTotal = parseFloat(cheapest.total.replace('R', ''));
      const currentTotal = parseFloat(current.total.replace('R', ''));
      return currentTotal < cheapestTotal ? current : cheapest;
    }, results[0]);
  }, [results]);

  const handleFindCheapestBasket = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shoppingList: shoppingList.split('\n').filter(item => item.trim() !== '') }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch prices');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-800">Smart Mzantsi</h1>
        <p className="text-lg text-gray-600">Your Guide to the Cheapest Groceries in South Africa</p>
      </header>
      
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <textarea
          className="w-full h-40 p-3 border border-gray-300 rounded-md mb-4 text-black focus:ring-2 focus:ring-blue-500 transition"
          value={shoppingList}
          onChange={(e) => setShoppingList(e.target.value)}
          placeholder="e.g., Milk, Bread, Eggs..."
        />
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 font-semibold shadow-sm"
            onClick={handleFindCheapestBasket}
            disabled={loading || !shoppingList.trim()}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : 'Find Cheapest Basket'}
          </button>
          {results.length > 0 && (
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors duration-300 font-semibold shadow-sm"
              onClick={handleFindCheapestBasket} // Refreshes the prices
              disabled={loading}
            >
              Refresh Prices
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-red-600 mt-6 text-center font-semibold bg-red-100 p-3 rounded-md max-w-2xl mx-auto">{error}</div>}

      {results.length > 0 && (
        <div className="mt-8">
          {cheapestStore && (
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-8 max-w-2xl mx-auto text-center shadow-lg">
              <h2 className="text-2xl font-bold text-green-800">Cheapest Store Found!</h2>
              <p className="text-xl text-green-700 mt-2">Your best option is <span className="font-extrabold">{cheapestStore.store}</span> with a total of <span className="font-extrabold">{cheapestStore.total}</span>.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((store) => (
              <div
                key={store.store}
                className={`border rounded-lg p-5 shadow-md transition-transform hover:scale-105 ${store.store === cheapestStore?.store ? 'bg-white border-green-500' : 'bg-white'}`}
              >
                <h2 className="text-2xl font-bold text-gray-800">{store.store}</h2>
                <p className="text-xl font-semibold text-gray-700 my-2">Total: {store.total}</p>
                <ul className="mt-4 space-y-2 text-gray-600">
                  {store.items.map((item, i: number) => (
                    <li key={i} className="flex justify-between items-center border-b pb-1">
                      <span className="font-medium">{item.name}</span>
                      <a href={item.url || ''} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline font-semibold">
                        {item.price ? `R${item.price.toFixed(2)}` : 'N/A'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}