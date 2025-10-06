import type { IProduct } from "../IProduct";

export interface ProductDto extends Omit<IProduct, 'categoryId' | 'supplierId' > {
    categoryId: { _id: string, name: string };
    supplierId?: { _id: string, name: string };
}
