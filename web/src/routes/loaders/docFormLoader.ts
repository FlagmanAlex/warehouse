// src/component/screens/DocForm/docFormLoader.ts
import { fetchApi } from '../../utils/fetchApi';
import type { DocDto, DocItemDto, DocOrderDto } from '@warehouse/interfaces/DTO';


export const docFormLoader = async ({ params }: { params: { id?: string } }) => {
  const { id: docId } = params;

    console.log('docId', docId);
    

  if (!docId) {
    return {
      doc: {
        docNum: '',
        docDate: new Date().toISOString(),
        bonusRef: 0,
        expenses: 0,
        itemCount: 0,
        summ: 0,
        orderNum: '',
        priority: 'Low',
        docType: 'Order', // ← можно передать через searchParams, если нужно
        status: 'Draft',
        customerId: { _id: '', name: '' },
        description: '',
      } as unknown as DocOrderDto,
      items: [],
      isNew: true,
    };
  }

  try {
    const data: { doc: DocDto; items: DocItemDto[] } = await fetchApi(`doc/${docId}`, 'GET');
    return {
      doc: data.doc,
      items: data.items,
      isNew: false,
    };
  } catch (error) {
    throw new Error((error as Error).message || 'Не удалось загрузить документ');
  }
};