import mongoose from 'mongoose';
import { DocModel } from '@models';           // ← Ваша модель Doc
import { DocItemsModel } from '@models'; // ← Ваша модель DocItems

/**
 * Пересчитывает сумму документа по всем его позициям и обновляет поле summ
 * @param docId — ID документа (строка или ObjectId)
 */
export async function recalculateDocSum(docId: string | mongoose.Types.ObjectId): Promise<void> {
  try {
    // Приводим docId к ObjectId, если передана строка
    const docIdObj = typeof docId === 'string' 
      ? new mongoose.Types.ObjectId(docId) 
      : docId;

    // Находим все позиции документа — строго типизированный запрос
    const items = await DocItemsModel.find({ docId: docIdObj }).lean();

    // Считаем сумму: quantity * unitPrice
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.quantity ?? 0) * ((item.unitPrice ?? 0) - (item.bonusStock ?? 0));
    }, 0);

    // Обновляем документ Doc — строго типизированное обновление
    const result = await DocModel.updateOne(
      { _id: docIdObj },
      { $set: { summ: totalAmount } }
    );

    if (result.matchedCount === 0) {
      console.warn(`⚠️ Документ с _id=${docId} не найден при обновлении суммы`);
    }

    // console.log(`✅ Summ for doc ${docId} recalculated: ${totalAmount}`);
  } catch (err) {
    console.error(`❌ Ошибка при пересчёте суммы для docId ${docId}:`, (err as Error).message);
  }
}