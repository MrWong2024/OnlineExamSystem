// src/types/entities/semester.entity.ts

export interface SemesterEntity {
  _id: string;
  name: string;
  createdAt: string;
  teacherId: string; // 可以加上，后端返回也会有
}
