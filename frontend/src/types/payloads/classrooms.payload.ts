// src/types/payloads/classrooms.payload.ts

import { ClassroomEntity } from "@/types/entities";

export interface CreateClassroomPayload {
  name: string;
}

export interface UpdateClassroomPayload {
  name: string;
}

export type ClassroomResponse = ClassroomEntity;
