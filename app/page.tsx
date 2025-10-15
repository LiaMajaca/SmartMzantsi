'use client';

import { useState } from 'react';
import styles from './page.module.css';

async function getLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

export default function Home() {
  const [shoppingList, setShoppingList] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindCheapestBasket = async () => {
    if (!shoppingList.trim()) {
      setError('Please enter at least one item.');
      return;
    }

    setError(null);
    setLoading(true);
    setResults([]);

    try {
      const position = await getLocation();
      const { latitude, longitude } = position.coords;

      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shoppingList, // <-- send as string (not array)
          location: { latitude, longitude },
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch prices');
      const data = await response.json();

      setResults(data);
    } catch (err: any) {
      console.error('Error fetching basket:', err);
      setError(err.message || 'Failed to find cheapest basket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>🛒 Smart Shopper SA</h1>
        <p className={styles.description}>
          Compare grocery prices across nearby stores in real-time.
        </p>

        <div className={styles.card}>
          <h2>Enter Your Shopping List</h2>
          <textarea
            className={styles.textarea}
            placeholder="e.g., Milk, Bread, Eggs"
            value={shoppingList}
            onChange={(e) => setShoppingList(e.target.value)}
          />
          <button
            onClick={handleFindCheapestBasket}
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Find Cheapest Basket'}
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        {results.length > 0 && (
          <div className={styles.results}>
            <h2>🛍️ Cheapest Stores</h2>
            {results.map((result, index) => (
              <div className={styles.result} key={index}>
                <h3>{result.store}</h3>
                <p><strong>Total:</strong> {result.total}</p>
                <p><strong>Distance:</strong> {result.distance}</p>
                <details>
                  <summary>View Item Prices</summary>
                  <ul>
                    {result.items.map((item: any, idx: number) => (
                      <li key={idx}>{item.name}: {item.price}</li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
