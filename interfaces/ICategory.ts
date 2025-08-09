
export interface ICategory {
    _id?: string;                       // _id категории
    name: string;                       // Название категории
    parentCategory?: string;            // Ссылка на родительскую категорию (если есть)
}