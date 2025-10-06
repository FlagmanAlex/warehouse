
/******************************
 * Типы документов
 *****************************/
export const DOC_TYPE_CONFIG = [
    { name: 'Order', icon: 'FaPen', nameRus: 'Заказ', color: '#000000' },
    { name: 'Incoming', icon: 'FaArrowRightToBracket', nameRus: 'Приход', color: '#00ff00' },
    { name: 'Outgoing', icon: 'FaArrowRightFromBracket', nameRus: 'Расход', color: '#ff0000' },
    { name: 'Transfer', icon: 'FaArrowsLeftRightToLine', nameRus: 'Перемещение', color: '#0000ff' },
] as const;

type DocType = typeof DOC_TYPE_CONFIG;

export type DocTypeName = DocType[number]['name'];

/******************************
 * Маппинг типов документов
 *****************************/
export const DocTypeMap = DOC_TYPE_CONFIG.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<DocTypeName, DocType[number]>);
