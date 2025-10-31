import { Request, Response } from 'express';

// Request body types
export interface GenerateNoteRequest {
  prompt: string;
  parentTitle?: string;
  parentContent?: string;
  parentTags?: string[];
}

export interface GenerateChildrenRequest {
  parentTitle: string;
  parentContent?: string;
  parentTags?: string[];
}

// Response types
export interface NoteResponse {
  title: string;
  content: string;
  tags: string[];
}

export interface ChildNote {
  title: string;
  content: string;
  tags: string[];
}

export interface GenerateChildrenResponse {
  children: ChildNote[];
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
  note?: string;
  details?: string;
}

// Controller types
export type ControllerHandler = (req: Request, res: Response) => Promise<void | Response> | void | Response;

// Express Request with typed body
export interface TypedRequest<T = any> extends Request {
  body: T;
}

