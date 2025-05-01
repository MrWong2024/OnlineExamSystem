// app/api/questions/route.ts

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');

  let backendEndpoint = `${BACKEND_API_URL}/questions`;
  const params = new URLSearchParams({
    page,
    limit,
  });

  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);

  if (query) {
    // 使用 search 参数
    backendEndpoint += `/search?q=${encodeURIComponent(query)}`;
  } else {
    // 使用常规查询参数
    backendEndpoint += `?${params.toString()}`;
  }

  try {
    const response = await fetch(backendEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('API /api/questions GET Error:', error.message);
    } else {
      console.error('API /api/questions GET Error:', error);
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const backendEndpoint = `${BACKEND_API_URL}/questions`;

  try {
    const body = await req.json();

    const response = await fetch(backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('API /api/questions POST Error:', error.message);
    } else {
      console.error('API /api/questions POST Error:', error);
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
