'use client';
import { useEffect, useState } from 'react';
import { getLocation } from './utils/geolocation';
import styles from './page.module.css';

export default function Home() {
  const [shoppingList, setShoppingList] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  const handleFindCheapestBasket = async () => {
    try {
      const position = await getLocation();
      setLocation(position);

      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shoppingList, location: position }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Smart Shopper SA</h1>
        <p className={styles.description}>
          Your price comparison tool for South African shoppers.
        </p>

        <div className={styles.card}>
          <h2>Enter Your Shopping List</h2>
          <textarea
            className={styles.textarea}
            placeholder="e.g., Milk, Bread, Eggs"
            value={shoppingList}
            onChange={(e) => setShoppingList(e.target.value)}
          ></textarea>
          <button onClick={handleFindCheapestBasket} className={styles.button}>Find Cheapest Basket</button>
        </div>

        {results.length > 0 && (
          <div className={styles.results}>
            <h2>Results</h2>
            {results.map((result, index) => (
              <div className={styles.result} key={index}>
                <h3>{result.store}</h3>
                <p>Total: {result.total}</p>
                <p>Distance: {result.distance}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}