import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shoppingList, location } = await request.json();

    // Parse shopping list (split by newlines, commas, or bullet points)
    const items = shoppingList
      .split(/[\n,•\-*]/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Please enter at least one item' },
        { status: 400 }
      );
    }

    // TODO: Implement actual price comparison logic
    // For now, return mock data
    const mockStores = [
      {
        store: 'Checkers',
        total: 'R' + (Math.random() * 500 + 200).toFixed(2),
        distance: (Math.random() * 10 + 1).toFixed(1) + ' km',
        items: items.map((item: string) => ({
          name: item,
          price: 'R' + (Math.random() * 50 + 10).toFixed(2),
        })),
      },
      {
        store: 'Pick n Pay',
        total: 'R' + (Math.random() * 500 + 200).toFixed(2),
        distance: (Math.random() * 10 + 1).toFixed(1) + ' km',
        items: items.map((item: string) => ({
          name: item,
          price: 'R' + (Math.random() * 50 + 10).toFixed(2),
        })),
      },
      {
        store: 'Woolworths',
        total: 'R' + (Math.random() * 500 + 300).toFixed(2),
        distance: (Math.random() * 10 + 1).toFixed(1) + ' km',
        items: items.map((item: string) => ({
          name: item,
          price: 'R' + (Math.random() * 50 + 15).toFixed(2),
        })),
      },
      {
        store: 'Shoprite',
        total: 'R' + (Math.random() * 500 + 180).toFixed(2),
        distance: (Math.random() * 10 + 1).toFixed(1) + ' km',
        items: items.map((item: string) => ({
          name: item,
          price: 'R' + (Math.random() * 50 + 8).toFixed(2),
        })),
      },
    ];

    // Sort by total price (extract number from string)
    mockStores.sort((a, b) => {
      const priceA = parseFloat(a.total.replace('R', ''));
      const priceB = parseFloat(b.total.replace('R', ''));
      return priceA - priceB;
    });

    return NextResponse.json(mockStores);
  } catch (error) {
    console.error('Error in /api/prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}