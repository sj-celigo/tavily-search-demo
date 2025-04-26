import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Tavily API key is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        include_images: false,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      switch (response.status) {
        case 400:
          return NextResponse.json(
            { error: 'Invalid request parameters' },
            { status: 400 }
          );
        case 401:
          return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
          );
        case 429:
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        case 432:
          return NextResponse.json(
            { error: 'Insufficient credits' },
            { status: 432 }
          );
        case 433:
          return NextResponse.json(
            { error: 'Service temporarily unavailable' },
            { status: 433 }
          );
        default:
          return NextResponse.json(
            { error: errorData?.error || 'Failed to fetch from Tavily API' },
            { status: response.status }
          );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 