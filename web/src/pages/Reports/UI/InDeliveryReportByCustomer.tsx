import type { DocItemDto } from '@warehouse/interfaces/DTO';
import { DOC_STATUS_ORDER } from '@warehouse/config';
import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import style from './style.module.css';
import { Icon } from '../../../shared/Icon';

interface Doc {
    _id: string;
    docNum: string;
    docDate: string;
    docTotalQty: number;
    docTotalSum: number;
    items: DocItemDto[];
}

interface CustomerGroup {
    customerId: string;
    customerName: string;
    totalPositions: number;
    totalBonus: number;
    totalSum: number;
    docs: Doc[];
}

// Группированный товар
interface GroupedProduct {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalSum: number;
    purchaseHistory: {
        docDate: string;
        docNum: string;
        quantity: number;
        unitPrice: number;
        sum: number;
    }[];
}

type SortField = 'name' | 'positions' | 'sum';
type SortOrder = 'asc' | 'desc';

const InProgressReportByCustomer = () => {
    const { response: data } = useLoaderData() as { response: CustomerGroup[] };
    const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
    const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();
    const [selectStatus, setSelectStatus] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const toggleCustomer = (customerId: string) => {
        setExpandedCustomers(prev => ({ ...prev, [customerId]: !prev[customerId] }));
    };

    const toggleProduct = (productKey: string) => {
        setExpandedProducts(prev => ({ ...prev, [productKey]: !prev[productKey] }));
    };

    // Функция сортировки клиентов
    const sortCustomers = (customers: CustomerGroup[]): CustomerGroup[] => {
        return [...customers].sort((a, b) => {
            let comparison = 0;
            
            switch (sortField) {
                case 'name':
                    comparison = a.customerName.localeCompare(b.customerName, 'ru');
                    break;
                case 'positions':
                    comparison = a.totalPositions - b.totalPositions;
                    break;
                case 'sum':
                    const aSum = a.totalSum - a.totalBonus;
                    const bSum = b.totalSum - b.totalBonus;
                    comparison = aSum - bSum;
                    break;
                default:
                    comparison = 0;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    };

    // Обработчик изменения сортировки
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Функция группировки товаров по покупателю
    const groupProductsByCustomer = (docs: Doc[]): GroupedProduct[] => {
        const productMap = new Map<string, GroupedProduct>();

        docs.forEach(doc => {
            doc.items.forEach(item => {
                const productId = item.productId._id;
                const productName = `${item.productId.categoryId.name}, ${item.productId.name}`;
                const key = productId;

                if (key) {
                    if (!productMap.has(key)) {
                        productMap.set(key, {
                            productId,
                            productName,
                            totalQuantity: 0,
                            totalSum: 0,
                            purchaseHistory: []
                        });
                    }
    
                    const grouped = productMap.get(key)!;
                    grouped.totalQuantity += item.quantity;
                    grouped.totalSum += item.quantity * item.unitPrice;
                    grouped.purchaseHistory.push({
                        docDate: doc.docDate,
                        docNum: doc.docNum,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        sum: item.quantity * item.unitPrice
                    });
                }
            });
        });

        // Сортируем историю покупок по дате (новые сверху)
        const result = Array.from(productMap.values());
        result.forEach(product => {
            product.purchaseHistory.sort((a, b) => 
                new Date(b.docDate).getTime() - new Date(a.docDate).getTime()
            );
        });

        return result;
    };

    const NavBar = () => {
        return (
            <nav className={style.navBar}>
                {DOC_STATUS_ORDER.map(status => {
                    const isActive = selectStatus === status.name;
                    return (
                        <div 
                            key={status.name}
                            className={`${style.navItem} ${isActive ? style.active : ''}`}
                            onClick={() => {
                                navigate(`/indelivery-report-by-customer?status=${status.name}`);
                                setSelectStatus(status.name);
                            }}
                        >
                            <Icon
                                name={status.icon}
                                color={isActive ? '#1976d2' : status.color}
                                size={30}
                            />
                            <span className={style.label}>{status.nameRus}</span>
                        </div>
                    );
                })}
            </nav>
        );
    };

    const SortHeader = () => {
        return (
            <div className={style.sortHeader}>
                <button 
                    className={`${style.sortButton} ${sortField === 'name' ? style.active : ''}`}
                    onClick={() => handleSort('name')}
                >
                    Клиент
                    {sortField === 'name' && (
                        <Icon 
                            name={sortOrder === 'asc' ? 'FaArrowDownAZ' : 'FaArrowUpZA'} 
                            size={16} 
                            color="#1976d2"
                        />
                    )}
                </button>
                <button 
                    className={`${style.sortButton} ${sortField === 'positions' ? style.active : ''}`}
                    onClick={() => handleSort('positions')}
                >
                    Количество
                    {sortField === 'positions' && (
                        <Icon 
                            name={sortOrder === 'asc' ? 'FaArrowDown19' : 'FaArrowUp91'} 
                            size={16} 
                            color="#1976d2"
                        />
                    )}
                </button>
                <button 
                    className={`${style.sortButton} ${sortField === 'sum' ? style.active : ''}`}
                    onClick={() => handleSort('sum')}
                >
                    Сумма
                    {sortField === 'sum' && (
                        <Icon 
                            name={sortOrder === 'asc' ? 'FaArrowDown19' : 'FaArrowUp91'} 
                            size={16} 
                            color="#1976d2"
                        />
                    )}
                </button>
            </div>
        );
    };

    let totalPositions = 0;
    let totalBonus = 0;
    let totalSum = 0;
    
    const sortedCustomers = sortCustomers(data);
    
    return (
        <div className={style.reportContainer}>
            <NavBar />
            <SortHeader />
            {sortedCustomers.map(customer => {
                totalPositions += customer.totalPositions;
                totalBonus += customer.totalBonus;
                totalSum += customer.totalSum;
                
                const groupedProducts = groupProductsByCustomer(customer.docs);
                
                return (
                    <div
                        key={customer.customerId}
                        className={`${style.customerContainer} ${expandedCustomers[customer.customerId] ? style.expanded : ''
                            }`}
                    >
                        <div
                            className={style.customerHeader}
                            onClick={() => toggleCustomer(customer.customerId)}
                        >
                            <h3 className={style.customerName}>{customer.customerName}</h3>
                            <span className={style.totalValue}>Кол: {customer.totalPositions}</span>
                            <span className={style.totalValue}>Сум: {customer.totalSum - customer.totalBonus}</span>
                        </div>

                        <div className={style.customerPositions}>
                            {expandedCustomers[customer.customerId] && (
                                <>
                                    <ul className={style.positionList}>
                                        {groupedProducts.map(product => {
                                            const productKey = `${customer.customerId}_${product.productId}`;
                                            const isProductExpanded = expandedProducts[productKey];
                                            
                                            return (
                                                <li key={product.productId} className={style.productGroupItem}>
                                                    <div 
                                                        className={style.productHeader}
                                                        onClick={() => toggleProduct(productKey)}
                                                    >
                                                        <div className={style.productHeaderLeft}>
                                                            <span className={style.productName}>{product.productName}</span>
                                                        </div>
                                                        <div className={style.productHeaderRight}>
                                                            <span className={style.quantity}>{product.totalQuantity} шт.</span>
                                                            <span className={style.sum}> = {product.totalSum.toFixed(0)}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {isProductExpanded && (
                                                        <div className={style.purchaseHistory}>
                                                            <table className={style.historyTable}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Дата</th>
                                                                        <th>№ док.</th>
                                                                        <th>Кол</th>
                                                                        <th>Цена</th>
                                                                        <th>Сумма</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {product.purchaseHistory.map((purchase, idx) => (
                                                                        <tr key={idx}>
                                                                            <td>{new Date(purchase.docDate).toLocaleDateString()}</td>
                                                                            <td>{purchase.docNum}</td>
                                                                            <td>{purchase.quantity}</td>
                                                                            <td>{purchase.unitPrice.toFixed(0)}</td>
                                                                            <td>{purchase.sum.toFixed(0)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                             </table>
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <div className={style.totalRow}>
                                        <span className={style.totalValue}>
                                            {customer.totalBonus > 0 && (<>Итого: {customer.totalSum} Скидка: {customer.totalBonus} <br /> </>)}
                                            К оплате: {customer.totalSum - customer.totalBonus}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
            <div className={style.globalTotal}>
                <h3 className={style.totalTitle}>Итого:</h3>
                <span className={style.totalValue}>Кол: {totalPositions} </span>
                <span className={style.totalValue}>{totalBonus > 0 && `Скидка: ${totalBonus} `}</span>
                <span className={style.totalValue}>Сумма: {totalSum - totalBonus}</span>
            </div>
        </div>
    );
};

export default InProgressReportByCustomer;