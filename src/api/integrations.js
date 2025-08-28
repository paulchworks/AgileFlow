// src/api/integrations.js
// Safe AWS-first shims. Replace with real API routes when ready.
import { BoardsAPI } from '@/lib/apiClient';

// Example shape if/when you add AWS endpoints under /integrations/*
// For now, provide explicit errors so UI never silently hits a non-AWS provider.
export const Core = {
  InvokeLLM: async () => { throw new Error('InvokeLLM not configured on AWS yet'); },
  SendEmail: async () => { throw new Error('SendEmail not configured on AWS yet'); },
  UploadFile: async () => { throw new Error('UploadFile not configured on AWS yet'); },
  GenerateImage: async () => { throw new Error('GenerateImage not configured on AWS yet'); },
  ExtractDataFromUploadedFile: async () => { throw new Error('ExtractDataFromUploadedFile not configured on AWS yet'); },
};

// Named exports (to keep any existing imports compiling)
export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;







