// src/types/entities/user.entity.ts

// ——完整用户实体，脱敏后结构（对标后端 user.schema）——
export interface UserEntity {
    userId: string; // 对应 _id
    name: string;
    identifier: string; // 工号/学号（可修改）
    role: "admin" | "teacher" | "student";
    email: string;
    phone?: string;
    createdAt: Date;
  }
  
  // ——用户个人信息编辑页面使用——
  export type UserProfile = Omit<UserEntity, "createdAt">;
  
  // ——JWT / auth / cookie session 中传递的数据结构——
  export type CurrentUserPayload = Pick<
    UserEntity,
    "userId" | "name" | "identifier" | "role"
  >;
  