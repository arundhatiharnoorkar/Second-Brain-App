export type Attachment = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt?: string;
};

export type Note = {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string | null;
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
  attachments?: Attachment[];
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type ShareStatus = {
  active: boolean;
  token?: string;
  includeAttachments: boolean;
};

export type SharedNote = {
  title: string;
  content: string;
  tags?: string | null;
  category?: string | null;
  attachments: Attachment[];
};
