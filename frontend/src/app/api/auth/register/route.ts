// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function POST(request: Request) {
  try {
    // 从请求中读取 JSON 数据
    const body = await request.json();
    // 向后端注册接口发起请求
    const res = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(errorData, { status: res.status });
    }
    const data = await res.json();
    // 返回后端响应给前端
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
