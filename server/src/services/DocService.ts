import { DocModel, DocItemsModel } from "@models";

export class DocService {
    static async getByStatus(status: string) {
        const docs = await DocModel.find({
            docStatus: status,
            docType: 'OrderOut',
        })
            .populate('customerId')
            .lean();

        if (!docs.length) return [];

        const docIds = docs.map(doc => doc._id);

        const docItems = await DocItemsModel.find({ docId: { $in: docIds } })
            .populate({
                path: 'productId',
                populate: { path: 'categoryId' },
            })
            .lean();

        const itemsByDocId = docItems.reduce((acc, item) => {
            const key = item.docId.toString();
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {} as Record<string, typeof docItems>);

        const groupedByCustomer = docs.reduce((acc, doc) => {
            const customerId = (doc.customerId as any)?._id?.toString() || 'unknown';
            const customerName = (doc.customerId as any)?.name || 'Не указан';

            if (!acc[customerId]) {
                acc[customerId] = {
                    customerId,
                    customerName,
                    docs: [],
                    totalPositions: 0,
                    totalBonus: 0,
                    totalSum: 0,
                };
            }

            const items = itemsByDocId[doc._id.toString()] || [];

            let docTotalSum = 0;
            let docTotalBonus = 0;
            let docTotalQty = 0;
            for (const item of items) {
                const qty = item.quantity || 0;
                const bonus = item.bonusStock || 0;
                const price = item.unitPrice || 0;
                docTotalSum += qty * price;
                docTotalBonus += qty * bonus;
                docTotalQty += qty;
            }

            acc[customerId].docs.push({ ...doc, items, docTotalQty, docTotalBonus, docTotalSum });
            acc[customerId].totalPositions += docTotalQty;
            acc[customerId].totalBonus += docTotalBonus;
            acc[customerId].totalSum += docTotalSum;

            return acc;
        }, {} as Record<string, any>);

        return Object.values(groupedByCustomer);
    }
}
