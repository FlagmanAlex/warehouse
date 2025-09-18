import type { DocDto } from "@warehouse/interfaces/DTO";
import { fetchApi } from "../../utils/fetchApi";


export const productLoader = async ({ request } : { request: Request }) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams

    try {
        const docs: DocDto[] = await fetchApi(
            `product`,
            'GET'
        )

        return {
            docs,
            filters: {
                search: searchParams.get('search') || ''
            }
        }
    } catch (error) {
        console.error('Ошибка в productLoader:', error)
        throw new Error('Ошибка загрузки продуктов')
    } 
}