export const PRODUCT_TYPE_CONFIG = [
    { nameRUS: 'Витамины', name: 'Vitamin' },
    { nameRUS: 'Парфюм', name: 'Parfum' },
    { nameRUS: 'Спортпит', name: 'Sport' },
    { nameRUS: 'Косметика', name: 'Cosmetic' }
] as const;

export type ProductType = typeof PRODUCT_TYPE_CONFIG [number]['name'];
export type ProductTypeRus = typeof PRODUCT_TYPE_CONFIG [number]['nameRUS'];

//Маппинг
export const ProductTypeMap = PRODUCT_TYPE_CONFIG.reduce((acc, item) => {
    acc[item.name] = item;
    return acc;
}, {} as Record<ProductType, typeof PRODUCT_TYPE_CONFIG[number]>);

export const ProductTypeRusMap = PRODUCT_TYPE_CONFIG.reduce((acc, item) => {
    acc[item.nameRUS] = item;
    return acc;
}, {} as Record<ProductTypeRus, typeof PRODUCT_TYPE_CONFIG[number]>);
