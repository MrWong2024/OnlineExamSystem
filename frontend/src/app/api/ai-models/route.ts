// src/app/api/ai-models/route.ts
import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/ai-models`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch AI model list from backend');
    }
    const data = await res.json();
    
    // 返回数据给前端
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
