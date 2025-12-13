import type { IDocOrderOut } from "@warehouse/interfaces";
import { fetchApi } from "../../api/fetchApi";

interface ApiDocResponse {
  _id: string;
  customerId: { name: string, phone: string };
  docs: IDocOrderOut[];
  totalPositions: number;
  totalSum: number;
}
    
export const deliveryNewLoader = async () => {
    try {
        const apiResponse: ApiDocResponse[] = await fetchApi('doc/status/InDelivery', 'GET');

        return { deliveries: apiResponse };
    } catch (e) {
        console.error('Ошибка загрузки документов', e);
        throw new Error('Ошибка загрузки документов')
    }
}