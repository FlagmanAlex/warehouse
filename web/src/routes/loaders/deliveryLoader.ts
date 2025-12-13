import type { DeliveryDto } from "@warehouse/interfaces/DTO";
import { fetchApi } from "../../api/fetchApi";
import { formatDate } from "../../utils/formatDateTime";

export const deliveryLoader = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams

    const startDate = searchParams.get('startDate') || formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())).toString()
    const endDate = searchParams.get('endDate') || formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)).toString()

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