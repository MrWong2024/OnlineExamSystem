// src/common/interfaces/current-user.interface.ts
export interface CurrentUserPayload {
  userId: string;
  name: string;
  identifier: string;
  role: 'admin' | 'teacher' | 'student'; // 有其他角色可以加上
}
