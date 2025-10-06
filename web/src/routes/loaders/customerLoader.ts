import { fetchApi } from "../../api/fetchApi";
import type { ICustomer } from "@warehouse/interfaces";


export const customerLoader = async ({ request } : { request: Request }): Promise<{ customers: ICustomer[], filters: { search: string } }> => {
    const url = new URL(request.url);
    const searchParams = url.searchParams

    try {
        const customers: ICustomer[] = await fetchApi(
            `customer`,
            'GET'
        )

        return {
            customers,
            filters: {
                search: searchParams.get('search') || ''
            }
        }
    } catch (error) {
        console.error('Ошибка в productLoader:', error)
        throw new Error('Ошибка загрузки продуктов')
    } 
}