import type { ProductDto } from "@warehouse/interfaces/DTO";
import { fetchApi } from "../../api/fetchApi";


export const productLoader = async ({ request } : { request: Request }): Promise<{ products: ProductDto[], filters: { search: string } }> => {
    const url = new URL(request.url);
    const searchParams = url.searchParams

    try {
        const products: ProductDto[] = await fetchApi(
            `product`,
            'GET'
        )

        return {
            products,
            filters: {
                search: searchParams.get('search') || ''
            }
        }
    } catch (error) {
        console.error('Ошибка в productLoader:', error)
        throw new Error('Ошибка загрузки продуктов')
    } 
}