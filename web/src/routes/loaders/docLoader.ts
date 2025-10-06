import type { DocDto } from "@warehouse/interfaces/DTO";
import { formatDate } from "../../utils/formatDate";
import { fetchApi } from "../../api/fetchApi";


export const docLoader = async ({ request } : { request: Request }) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams

    const startDate = searchParams.get('startDate') || formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).toString()
    const endDate = searchParams.get('endDate') || formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1)).toString()

    try {
        const docs: DocDto[] = await fetchApi(
            `doc?startDate=${startDate}&endDate=${endDate}`,
            'GET'
        )

        return {
            docs,
            filters: {
                startDate,
                endDate,
                docType: searchParams.get('docType'),
                docStatus: searchParams.get('docStatus'),
                search: searchParams.get('search') || '',
                filterShow: searchParams.get('filterShow') === 'true'
            }
        }
    } catch (error) {
        console.error('Ошибка в docLoader:', error)
        throw new Error('Ошибка загрузки документов')
    } 
}