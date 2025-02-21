// src/app/api/ai-models/route.ts
import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

// 添加这一行来指定路由应该总是动态生成
// export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/ai-models`, { cache: 'no-cache' }); // { cache: 'no-store' }会导致构建失败，除非加上export const dynamic = 'force-dynamic';
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
