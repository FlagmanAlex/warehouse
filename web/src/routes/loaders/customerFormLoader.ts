import { fetchApi } from "../../api/fetchApi";
import type { IAddress, ICustomer } from "@warehouse/interfaces";

// Вспомогательная функция для создания пустого клиента
const createEmptyCustomer = (): ICustomer => ({
    name: '',
    phone: '',
    email: '',
    address: '',
    gps: '',
    percent: 0,
    accountManager: '',
    contactPerson: '',
});

export const customerFormLoader = async ({
    params
}: {
    params: { customerId?: string };
}): Promise<{ customer: ICustomer, addresses: IAddress[] }> => {
    const { customerId } = params;

    // Если customerId не указан — создаём нового клиента (пустой объект)
    if (!customerId) {
        return { customer: createEmptyCustomer(), addresses: [] };
    }

    try {
        const customer: ICustomer = await fetchApi(`customer/${customerId}`, 'GET');
        const addresses: IAddress[] = await fetchApi(`address/${customerId}`, 'GET');
        return { customer, addresses };
    } catch (error) {
        console.error('Ошибка загрузки клиента:', error);

        // Опционально: можно выбросить ошибку, чтобы показать страницу ошибки
        // throw new Response('Не удалось загрузить клиента', { status: 500 });

        // Или вернуть пустого клиента (как fallback)
        return { customer: createEmptyCustomer() as ICustomer, addresses: [] as IAddress[] };
    }
};