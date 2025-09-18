import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import style from'./StockProduct.module.css';

type MovementItem = {
    _id: string;
    transactionType: 'in' | 'out';
    orderId: {
        _id: string;
        orderDate: string;
        orderNum: string;
    };
    productId: {
        _id: string;
        name: string;
        article: string;
    };
    warehouseId: {
        _id: string;
        name: string;
    };
    batchId: {
        _id: string;
        quantityReceived: number;
        purchasePrice: number;
        expirationDate: string;
        receiptDate: string;
        unitOfMeasure: string;
        status: string;
    };
    previousQuantity: number;
    changeQuantity: number;
    newQuantity: number;
    userId: string;
    transactionDate: string;
};

export const StockProduct = () => {
    const { productId } = useParams<{ productId: string }>();
    const [movements, setMovements] = useState<MovementItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ Заменил на относительный путь — предполагаем, что API на том же домене
                const response = await fetch(`/api/transaction/${productId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();

                const sortedData = data.sort((a: MovementItem, b: MovementItem) =>
                    new Date(a.orderId.orderDate).getTime() - new Date(b.orderId.orderDate).getTime()
                );

                setMovements(sortedData);
            } catch (error) {
                console.log('Ошибка при загрузке движений', error);
            }
        };

        if (productId) {
            fetchData();
        }
    }, [productId]);

    return (
        <div className={style.stockProductContainer}>
            <h2>Движение товара</h2>

            <div className={style.tableHeader}>
                <div className="cell" style={{ width: '90px' }}>Дата</div>
                <div className="cell" style={{ width: '80px' }}>Номер</div>
                <div className="cell" style={{ width: '50px' }}>Тип</div>
                <div className="cell" style={{ width: '60px' }}>Кол.</div>
                <div className="cell" style={{ width: '60px' }}>Цена</div>
            </div>

            {movements.length === 0 ? (
                <div className={style.emptyState}>
                    <p>Нет данных о движениях</p>
                </div>
            ) : (
                <div className={style.movementsList}>
                    {movements.map((item) => (
                        <div key={item._id} className={style.tableRow}>
                            <div className={`${style.cell} ${style.dateCell}`}>
                                {new Date(item.orderId.orderDate).toLocaleDateString()}
                            </div>
                            <div className={style.cell}>{item.orderId.orderNum}</div>
                            <div className={`${style.cell} ${item.transactionType === 'in' ? style.income : style.expense}`}>
                                {item.transactionType === 'in' ? 'Приход' : 'Расход'}
                            </div>
                            <div className={`${style.cell} ${style.valueCell}`}>{Math.abs(item.changeQuantity)}</div>
                            <div className={`${style.cell} ${style.valueCell}`}>{item.batchId.purchasePrice.toFixed(0)}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
