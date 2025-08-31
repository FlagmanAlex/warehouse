import { IProduct } from "../IProduct";

export interface ProductDto extends Omit<IProduct, 'categoryId'> {
    categoryId: { _id: string, name: string };
}
