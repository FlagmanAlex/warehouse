// actions/deliveryAction.ts
import type { ActionFunctionArgs } from 'react-router-dom';
import { fetchApi } from '../../api/fetchApi';

export const deliveryAction = async ({ request, params }: ActionFunctionArgs) => {

  const deliveryId = params.id;

  switch (request.method) {
    case 'POST':
      console.log('POST', request);
      try {
        const formData: any = await request.formData();
        const docIds = formData.getAll('docIds') as string[];
        const delivery = JSON.parse(formData.get('delivery') as string);


        const deliveryData = {
          ...delivery,
          docIds: docIds
        }
        console.log('deliveryData', deliveryData);


        const result = await fetchApi('delivery', 'POST', deliveryData);
        return { success: true, data: result };
      } catch (error) {
        console.error('Ошибка при создании доставки:', error);
        return { success: false, error: (error as Error).message };
      }

    case 'PATCH':
      console.log('PATCH', request);
      try {
        const formData: any = await request.formData();
        // const deliveryData = Object.fromEntries(formData);
        const deliveryData = JSON.parse(formData.get('delivery') as string);
        // Получаем массив docIds
        console.log(deliveryData);
        
        // Добавляем docIds в deliveryData

        // ВАЖНО: Убедитесь, что ваш backend (fetchApi) ожидает поле docIds
        // и умеет его обрабатывать.
        const result = await fetchApi(`delivery/${deliveryId}`, 'PATCH', deliveryData);
        return { success: true, data: result };
        // ВАЖНО: Убедитесь, что ваш backend (fetchApi) ожидает поле docIds
        // и умеет его обрабатывать.
      } catch (error) {
        console.error('Ошибка при обновлении доставки:', error);
        return { success: false, error: (error as Error).message };
      }
    case 'DELETE':
      console.log('DELETE', request);
      try {
        console.log(deliveryId);
        // ВАЖНО: Убедитесь, что ваш backend (fetchApi) ожидает поле docIds
        // и умеет его обрабатывать.
        const result = await fetchApi(`delivery/${deliveryId}`, 'DELETE');
        return { success: true, data: result };
        // ВАЖНО: Убедитесь, что ваш backend (fetchApi) ожидает поле docIds
        // и умеет его обрабатывать.
      } catch (error) {
        console.error('Ошибка при удалении доставки:', error);
        return { success: false, error: (error as Error).message };
      }
  }
}

