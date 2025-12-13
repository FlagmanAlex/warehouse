
export interface ICategory {
    _id?: string;                       // _id категории
    name: string;                       // Название категории
    logo?: string;                       // Логотип
    parentCategory?: string;            // Ссылка на родительскую категорию (если есть)
}