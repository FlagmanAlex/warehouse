import { fetchApi } from "../../api/fetchApi";

export const inDeliveryReportLoader = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams
    const status = searchParams.get('status');

    try {
        const response = await fetchApi(`doc/status/${status}`);
        if (!response) {
            throw new Error('Отчеты не загрузились');
        }

        return { response }
    } catch (error) {
        console.error('Ошибка в inDeliveryReportLoader:', error);
        throw new Error('Ошибка загрузки отчетов');
    }

}