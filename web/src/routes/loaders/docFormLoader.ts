// src/component/screens/DocForm/docFormLoader.ts
import { fetchApi } from '../../api/fetchApi';
import type { DocDto, DocItemDto, DocIncomingDto, DocOrderInDto, DocOrderOutDto, DocTransferDto } from '@warehouse/interfaces/DTO';


export const docFormLoader = async ({ params, request }: { params: { id?: string }, request: Request }) => {
  const { id: docId } = params;

  if (!docId) {
    const docType = new URL(request.url).searchParams.get('docType') || 'OrderOut';
    const base = {
      docNum: '',
      docDate: new Date(),
      bonusRef: 0,
      expenses: 0,
      itemCount: 0,
      summ: 0,
      orderNum: '',
      priority: '',
      docType,
      docStatus: 'Draft',
      description: '',
    };

    switch (docType) {
      case 'OrderIn':
        return { doc: { ...base, supplierId: { _id: '', name: '' } } as unknown as DocOrderInDto, items: [], isNew: true };
      case 'Incoming':
        return { doc: { ...base, supplierId: { _id: '', name: '' }, warehouseId: { _id: '', name: '' } } as unknown as DocIncomingDto, items: [], isNew: true };
      case 'Transfer':
        return { doc: { ...base, fromWarehouseId: { _id: '', name: '' }, toWarehouseId: { _id: '', name: '' } } as unknown as DocTransferDto, items: [], isNew: true };
      default: // OrderOut
        return { doc: { ...base, customerId: { _id: '', name: '' } } as unknown as DocOrderOutDto, items: [], isNew: true };
    }
  }

  try {
    const data: { doc: DocDto; items: DocItemDto[] } = await fetchApi(`doc/${docId}`, 'GET');
    if (!data) {
      throw new Error('Документ не найден');
    }
    return {
      doc: data.doc,
      items: data.items,
    };

  } catch (error) {
    throw new Error((error as Error).message || 'Не удалось загрузить документ');
  }
};
