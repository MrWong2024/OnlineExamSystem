// app/api/questions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const backendEndpoint = `${BACKEND_API_URL}/questions/${id}`;

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
      console.error(`API /api/questions/${id} GET Error:`, error.message);
    } else {
      console.error(`API /api/questions/${id} GET Error:`, error);
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const backendEndpoint = `${BACKEND_API_URL}/questions/${id}`;

  try {
    const body = await req.json();

    const response = await fetch(backendEndpoint, {
      method: 'PATCH',
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
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`API /api/questions/${id} PATCH Error:`, error.message);
    } else {
      console.error(`API /api/questions/${id} PATCH Error:`, error);
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const backendEndpoint = `${BACKEND_API_URL}/questions/${id}`;

  try {
    const response = await fetch(backendEndpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    return NextResponse.json(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`API /api/questions/${id} DELETE Error:`, error.message);
    } else {
      console.error(`API /api/questions/${id} DELETE Error:`, error);
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
