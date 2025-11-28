import type { DeliveryDto } from "@warehouse/interfaces/DTO";
import { fetchApi } from "../../api/fetchApi";
import { formatDate } from "../../utils/formatDate";

export const deliveryLoader = async ({ request, params } : { request: Request, params: { id?: string } }) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams
    const { id } = params;

    if (id) {
        return {
            delivery: await fetchApi(`delivery/${id}`, 'GET')
        }
    } else {

        const startDate = searchParams.get('startDate') || formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())).toString()
        const endDate = searchParams.get('endDate') || formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)).toString()
    
        console.log(startDate, endDate);
    
    
        try {
            const deliveries: DeliveryDto[] = await fetchApi(
                `delivery?startDate=${startDate}&endDate=${endDate}`,
                'GET'
            )
    
            return {
                deliveries,
                filters: {
                    startDate,
                    endDate,
                }
            }
        } catch (error) {
            console.error('Ошибка в docLoader:', error)
            throw new Error('Ошибка загрузки документов')
        } 
    }

}