import type { DocDto, DocItemDto } from "@warehouse/interfaces/DTO";

// src/types/forms/DocForm.ts
export interface DocFormData {
  doc: DocDto;
  items: DocItemDto[];
}

export interface DocFormProps {
  initialData?: DocFormData;
  onSubmit: (data: DocFormData) => void;
  isSubmitting: boolean;
}