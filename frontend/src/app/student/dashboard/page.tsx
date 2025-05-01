"use client";
import React from "react";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页头 */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">学生工作台</h1>
        <p className="text-gray-600">欢迎回来，学生！</p>
      </header>

      {/* 功能卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">待完成作业</h2>
          <p>查看并完成您当前的作业和测验</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">成绩报告</h2>
          <p>查看您的成绩、排名和进步报告</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">通知公告</h2>
          <p>查看系统通知和课程公告</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">个人中心</h2>
          <p>更新个人信息和账户设置</p>
        </div>
      </div>
    </div>
  );
}
