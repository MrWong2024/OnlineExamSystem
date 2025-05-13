// src/types/payloads/courses.payload.ts

// 创建课程（POST /courses）
export interface CreateCoursePayload {
  name: string;
}

// 更新课程（PUT /courses/:id）
export interface UpdateCoursePayload {
  name: string;
}

// API 响应结构：返回完整 Course 实体（可复用 CourseEntity）
import { CourseEntity } from "../entities";

export type CourseResponse = CourseEntity;
