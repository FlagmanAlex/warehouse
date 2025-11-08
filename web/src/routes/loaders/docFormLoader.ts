// src/component/screens/DocForm/docFormLoader.ts
import { fetchApi } from '../../api/fetchApi';
import type { DocDto, DocItemDto, DocOrderOutDto } from '@warehouse/interfaces/DTO';


export const docFormLoader = async ({ params }: { params: { id?: string } }) => {
  const { id: docId } = params;


  if (!docId) {
    return {
      doc: {
        docNum: '',
        docDate: new Date(),
        bonusRef: 0,
        expenses: 0,
        itemCount: 0,
        summ: 0,
        orderNum: '',
        priority: '',
        docType: 'OrderOut', // ← можно передать через searchParams, если нужно
        docStatus: 'Draft',
        customerId: { _id: '', name: '' },
        description: '',
      } as unknown as DocOrderOutDto,
      items: [],
      isNew: true,
    };
  }

  try {
    const data: { doc: DocDto; items: DocItemDto[] } = await fetchApi(`doc/${docId}`, 'GET');
    if (!data) {
      throw new Error('Документ не найден');
    }
    return {
      doc: data.doc,
      items: data.items,
    };

  } catch (error) {
    throw new Error((error as Error).message || 'Не удалось загрузить документ');
  }
};