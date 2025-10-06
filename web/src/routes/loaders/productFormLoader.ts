import type { ProductDto } from "@warehouse/interfaces/DTO";
import { fetchApi } from "../../api/fetchApi";

export const productFormLoader = async ({ params }: { params: { productId?: string } }): Promise<{ product: ProductDto }> => {
    const { productId } = params;

    // Только если productId отсутствует — возвращаем новый продукт
    if (!productId) {
        return {
            product: {
                article: '',
                name: '',
                price: 0,
                categoryId: { _id: '', name: '' },
                supplierId: { _id: '', name: '' },
                isArchived: false
            }
        };
    }

    try {
        // Запрашиваем продукт
        const product: ProductDto = await fetchApi(`product/${productId}`, 'GET');

        // Проверяем, что данные пришли реально
        if (!product || !product._id) {
            throw new Error('Invalid product data received');
        }

        return { product };
    } catch (error) {
        console.error('Ошибка в productFormLoader:', (error as Error).message);

        // В production лучше показать ошибку, а не молча подменять на пустой объект
        // Но если хочешь — можно вернуть дефолт, но тогда форма будет пустой — и это ожидаемо
        throw new Error('Не удалось загрузить продукт');
    }
};