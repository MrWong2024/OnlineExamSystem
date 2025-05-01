// src/types/payloads/users.payload.ts
import { UserEntity } from "@/types/entities";

export type UpdateUserPayload = Partial<
  Pick<UserEntity, "name" | "email" | "phone" | "identifier">
>;

export type UpdateUserResponse = UserEntity;
