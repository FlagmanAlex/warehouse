import { fetchApi } from "../../api/fetchApi";
import type { IAddress, ICustomer } from "@warehouse/interfaces";

type customersWithAddresses = ICustomer & { addresses: IAddress[] };

export const customerLoader = async ({ request } : { request: Request }): Promise<{ customers: customersWithAddresses[], filters: { search: string } }> => {
    const url = new URL(request.url);
    const searchParams = url.searchParams

    try {
        const customers: customersWithAddresses[] = await fetchApi(
            `customer`,
            'GET'
        )

        return {
            customers: customers,
            filters: {
                search: searchParams.get('search') || ''
            }
        }
    } catch (error) {
        console.error('Ошибка в productLoader:', error)
        throw new Error('Ошибка загрузки продуктов')
    } 
}