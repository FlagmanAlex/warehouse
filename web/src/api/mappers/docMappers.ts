// src/api/mappers/docMappers.ts

import type { IDoc, IDocIncoming, IDocItem, IDocOrderOut, IDocOutgoing, IDocTransfer } from "@warehouse/interfaces";
import type { DocDto, DocIncomingDto, DocItemDto, DocOrderInDto, DocOrderOutDto, DocOutgoingDto, DocTransferDto } from "@warehouse/interfaces/DTO";


// DTO -> Domain
export const dtoToDoc = (dto: DocDto): IDoc => {
  console.log('dtoToDoc', dto);
  const base = {
    _id: dto._id,
    orderNum: dto.orderNum,
    docNum: dto.docNum,
    docDate: new Date(dto.docDate),
    bonusRef: dto.bonusRef,
    summ: dto.summ,
    updatedAt: new Date(),
    description: dto.description,
    docType: dto.docType,
    docStatus: dto.docStatus,
  };

  switch (dto.docType) {
    case 'OrderIn': {
      const orderDto = dto as DocOrderInDto;
      return {
        ...base,
        customerId: orderDto.supplierId?._id || '',
        priority: orderDto.priority,
        expenses: orderDto.expenses,
      } as IDocOrderOut;
    }
    case 'OrderOut': {
      const orderDto = dto as DocOrderOutDto;
      return {
        ...base,
        customerId: orderDto.customerId?._id || '',
        priority: orderDto.priority,
        expenses: orderDto.expenses,
        addressId: orderDto.addressId,
      } as IDocOrderOut;
    }

    case 'Transfer': {
      const transferDto = dto as DocTransferDto;
      return {
        ...base,
        warehouseId: dto.warehouseId?._id || '',
        fromWarehouseId: transferDto.fromWarehouseId?._id || '',
        toWarehouseId: transferDto.toWarehouseId?._id || '',
      } as IDocTransfer;
    }

    case 'Incoming': {
      const incomingDto = dto as DocIncomingDto;
      return {
        ...base,
        warehouseId: dto.warehouseId?._id || '',
        supplierId: incomingDto.supplierId?._id || '',
        vendorCode: incomingDto.vendorCode,
        exchangeRate: incomingDto.exchangeRate,
        expenses: incomingDto.expenses,
      } as IDocIncoming;
    }

    case 'Outgoing': {
      const outgoingDto = dto as DocOutgoingDto;
      return {
        ...base,
        warehouseId: dto.warehouseId?._id || '',
        customerId: outgoingDto.customerId?._id || '',
        addressId: outgoingDto.addressId,
      } as IDocOutgoing;
    }

    default:
      throw new Error(`Unknown doc type: ${dto}`);
  }
};

export const dtoItemToDocItem = (dto: DocItemDto): IDocItem => ({
  // _id: dto._id,
  docId: dto.docId,
  productId: dto.productId._id!,
  quantity: dto.quantity,
  unitPrice: dto.unitPrice,
  description: dto.description,
  bonusStock: dto.bonusStock,
});