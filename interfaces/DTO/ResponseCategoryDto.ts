// CategoryResponseDto.ts
export interface ResponseCategoryDto {
  _id: string;
  name: string;
  parentCategory?: string;
  parentCategoryName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}