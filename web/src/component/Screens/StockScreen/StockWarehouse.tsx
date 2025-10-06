import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../../api/fetchApi';
import style from './StockWarehouse.module.css';

type ProductBatch = {
    _id: string;
    warehouseId: {
        _id: string;
        name: string;
    };
    batchId: {
        _id: string;
        productId: string;
        supplierId: string;
        quantityReceived: number;
        purchasePrice: number;
        expirationDate: string;
        receiptDate: string;
        unitOfMeasure: string;
        status: string;
        warehouseId: string;
    };
    lastUpdate: string;
    productId: {
        _id: string;
        name: string;
        article: string;
        categoryId: {
            _id: string;
            name: string;
        };
        unitOfMeasurement: string;
        price: number;
        isArchived: boolean;
        createdBy: string;
        lastUpdateBy: string;
        supplierId: string;
    };
    quantityAvailable: number;
};

type GroupedProduct = {
    id: string;
    name: string;
    totalQuantity: number;
    batches: ProductBatch[];
};

const StockWarehouse = () => {
    const [db, setDb] = useState<ProductBatch[]>([]);
    const [filteredData, setFilteredData] = useState<ProductBatch[]>([]);
    const [productNameFilter, setProductNameFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expirationFilter, setExpirationFilter] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const navigate = useNavigate();

    // Загрузка данных
    const fetchData = async () => {
        try {
            const response: ProductBatch[] = await fetchApi(
                `inventory/warehousenotnull/685415c8afe93552b9aec620`,
                'GET',
                {}
            );
            setDb(response);
            setFilteredData(response);
        } catch (error) {
            console.log('Ошибка при загрузке данных', error);
        }
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        applyFilters();
        setIsRefreshing(false);
    };

    // Группировка
    const getGroupedProducts = (data: ProductBatch[]): GroupedProduct[] => {
        return Object.values(
            data.reduce((acc, item) => {
                if (!acc[item.productId._id]) {
                    acc[item.productId._id] = {
                        id: item.productId._id,
                        name: item.productId.name,
                        totalQuantity: 0,
                        batches: [],
                    };
                }
                acc[item.productId._id].batches.push(item);
                acc[item.productId._id].totalQuantity += item.quantityAvailable;
                return acc;
            }, {} as Record<string, GroupedProduct>)
        );
    };

    const products = getGroupedProducts(filteredData);

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    // Фильтрация
    const applyFilters = () => {
        let filtered = db;

        if (productNameFilter.trim()) {
            filtered = filtered.filter((item) =>
                item.productId.name.toLowerCase().includes(productNameFilter.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((item) => item.batchId.status === statusFilter);
        }

        const today = new Date();
        if (expirationFilter === 'soon') {
            filtered = filtered.filter((item) => {
                const expDate = new Date(item.batchId.expirationDate);
                const daysLeft = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return daysLeft > 0 && daysLeft <= 30;
            });
        } else if (expirationFilter === 'expired') {
            filtered = filtered.filter((item) => {
                const expDate = new Date(item.batchId.expirationDate);
                return expDate < today;
            });
        }

        setFilteredData(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [productNameFilter, statusFilter, expirationFilter]);

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className={style.stockWarehouseContainer}>
            <h2>Остатки на складе</h2>

            {/* Фильтры */}
            <div className={style.filters}>
                <input
                    type="text"
                    placeholder="Поиск по названию"
                    value={productNameFilter}
                    onChange={(e) => setProductNameFilter(e.target.value)}
                    className={style.filterInput}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={style.filterSelect}
                >
                    <option value="all">Все статусы</option>
                    <option value="активный">Активный</option>
                    <option value="неактивный">Неактивный</option>
                </select>

                <select
                    value={expirationFilter}
                    onChange={(e) => setExpirationFilter(e.target.value)}
                    className={style.filterSelect}
                >
                    <option value="all">Все партии</option>
                    <option value="soon">Ближайшие к истечению</option>
                    <option value="expired">Истёкшие</option>
                </select>

                <button onClick={onRefresh} disabled={isRefreshing} className={style.refreshBtn}>
                    {isRefreshing ? 'Обновление...' : 'Обновить'}
                </button>
            </div>

            {/* Список товаров */}
            <div className={style.productsList}>
                {products.length === 0 ? (
                    <p>Нет данных</p>
                ) : (
                    products.map((item) => {
                        const quantity = item.totalQuantity;
                        const latestBatch = item.batches.sort(
                            (a, b) => new Date(b.batchId.receiptDate).getTime() - new Date(a.batchId.receiptDate).getTime()
                        )[0];
                        const price = latestBatch?.batchId.purchasePrice.toFixed(0) || 0;
                        const sum = item.batches
                            .reduce((acc, batch) => acc + batch.batchId.purchasePrice * batch.quantityAvailable, 0)
                            .toFixed(0);

                        return (
                            <div key={item.id} className={style.productGroup}>
                                <div className={style.productHeader} onClick={() => toggleExpand(item.id)}>
                                    <div className={style.productInfo}>
                                        <h4>{`${item.batches[0].productId.categoryId.name}, ${item.name}`}</h4>
                                        <div className={style.productMeta}>
                                            <span>Остаток: {quantity}</span>
                                            <span>Цена: {price}</span>
                                            <span>Сумма: {sum}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={style.movementBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/stock-product/${item.id}`);
                                        }}
                                    >
                                        Движение
                                    </button>
                                    <span className={style.expandArrow}>
                                        {expandedIds.has(item.id) ? '▼' : '▶'}
                                    </span>
                                </div>

                                {expandedIds.has(item.id) && (
                                    <div className={style.batchList}>
                                        {item.batches.map((batch) => (
                                            <div key={batch._id} className={style.batchItem}>
                                                <p><strong>Артикул:</strong> {batch.productId.article}</p>
                                                <p><strong>Название:</strong> {batch.productId.name}</p>
                                                <p><strong>Количество:</strong> {batch.quantityAvailable}</p>
                                                <p><strong>Дата поступления:</strong> {new Date(batch.batchId.receiptDate).toLocaleDateString()}</p>
                                                <p><strong>Срок годности:</strong> {new Date(batch.batchId.expirationDate).toLocaleDateString()}</p>
                                                <p><strong>Ед. изм.:</strong> {batch.batchId.unitOfMeasure}</p>
                                                <p><strong>Статус:</strong> {batch.batchId.status}</p>
                                                <p><strong>Цена закупки:</strong> {batch.batchId.purchasePrice.toFixed(0)} руб.</p>
                                                <p><strong>Склад:</strong> {batch.warehouseId.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default StockWarehouse;