// src/app/api/compile/route.ts
import { NextResponse } from 'next/server';

const backendApiUrl = process.env.BACKEND_API_URL;

export async function POST(request: Request) {
  if (!backendApiUrl) {
    return NextResponse.json(
      { message: 'Backend API URL is not configured' },
      { status: 500 }
    );
  }

  const { code } = await request.json();

  // 构造后端编译接口地址
  const compileUrl = `${backendApiUrl}/compile`;

  // 调用后端的编译服务
  const backendRes = await fetch(compileUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  if (!backendRes.ok) {
    const errData = await backendRes.json();
    return NextResponse.json({ message: 'Compilation failed', details: errData }, { status: 500 });
  }

  const result = await backendRes.json();
  return NextResponse.json(result);
}
