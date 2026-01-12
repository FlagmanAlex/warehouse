import { DocItemsModel, IDocItemsModel } from '@models';
import { IDocItem } from '@warehouse/interfaces';
import { recalculateDocSum } from '../utils/recalculateDocSum';

export class DocItemService {
  // --- CREATE ---
  static async create(docItemData: IDocItem): Promise<IDocItemsModel> {
    const newItem = new DocItemsModel(docItemData);
    const savedItem = await newItem.save();

    // ✅ ПЕРЕСЧИТЫВАЕМ СУММУ ДОКУМЕНТА — СИНХРОННО!
    await recalculateDocSum(savedItem.docId);

    return savedItem;
  }

  // --- UPDATE ---
  static async update(id: string, updates: IDocItem): Promise<IDocItemsModel> {
    const item = await DocItemsModel.findByIdAndUpdate(id, updates, { new: true });

    if (!item) throw new Error('DocItem не найден');

    // ✅ ПЕРЕСЧИТЫВАЕМ СУММУ ДОКУМЕНТА — СИНХРОННО!
    await recalculateDocSum(item.docId);

    return item;
  }

  // --- DELETE ---
  static async delete(id: string): Promise<void> {
    const item = await DocItemsModel.findByIdAndDelete(id);

    if (!item) throw new Error('DocItem не найден');

    // ✅ ПЕРЕСЧИТЫВАЕМ СУММУ ДОКУМЕНТА — СИНХРОННО!
    await recalculateDocSum(item.docId);
  }

  // --- УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ПЕРЕСЧЁТА ---
  // private static async recalculateDocSum(docId: string | Types.ObjectId): Promise<void> {
  //   try {
  //     const docIdObj = typeof docId === 'string' ? new Types.ObjectId(docId) : docId;

  //     const items = await DocItemsModel.find({ docId: docIdObj }).lean();
  //     const totalAmount = items.reduce((sum, item) => {
  //       return sum + (item.quantity ?? 0) * (item.unitPrice ?? 0);
  //     }, 0);

  //     await DocModel.updateOne(
  //       { _id: docIdObj },
  //       { $set: { summ: totalAmount } }
  //     );

  //     console.log(`✅ Сумма документа ${docId} пересчитана: ${totalAmount}`);
  //   } catch (err) {
  //     console.error(`❌ Ошибка пересчета суммы документа ${docId}:`, (err as Error).message);
  //   }
  // }
}