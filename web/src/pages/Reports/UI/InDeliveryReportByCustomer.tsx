import type { IProduct } from '@warehouse/interfaces';
import { DOC_STATUS_ORDER } from '@warehouse/interfaces/config';
import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import style from './style.module.css';
import { Icon } from '../../../shared/Icon';

interface DocItem {
    _id: string;
    productId: IProduct;
    quantity: number;
    unitPrice: number;
}

interface Doc {
    _id: string;
    docNum: string;
    docDate: string;
    docTotalQty: number;
    docTotalSum: number;
    items: DocItem[];
}

interface CustomerGroup {
    customerId: string;
    customerName: string;
    totalPositions: number;
    totalSum: number;
    docs: Doc[];
}


const InProgressReportByCustomer = () => {
    const { response: data } = useLoaderData() as { response: CustomerGroup[] };
    const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();
    const [selectStatus, setSelectStatus] = useState('');

    const toggleCustomer = (customerId: string) => {
        setExpandedCustomers(prev => ({ ...prev, [customerId]: !prev[customerId] }));
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
                            // className={style.icon}
                            name={status.icon}
                            color={isActive ? '#1976d2' : status.color} // Меняем цвет на брендовый при активации
                            size={30}
                        />
                        <span className={style.label}>{status.nameRus}</span>
                    </div>
                );
            })}
        </nav>
    );
};

    let totalPositions = 0;
    let totalSum = 0;
    return (
        <div className={style.reportContainer}>
            {<NavBar />}
            {data.map(customer => {
                totalPositions += customer.totalPositions;
                totalSum += customer.totalSum;
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
                            <span className={style.totalValue}>Сум: {customer.totalSum}</span>

                        </div>

                        <div className={style.customerPositions}>
                            {expandedCustomers[customer.customerId] && (
                                <>
                                    <ul className={style.positionList}>
                                        {customer.docs.flatMap(doc =>
                                            doc.items.map(item => (
                                                <li key={item._id} className={style.positionItem}>
                                                    <span className={style.productName}>{item.productId.name}</span>
                                                    <span className={style.quantity}>{`${item.quantity}шт. х ${item.unitPrice.toFixed(0)}`} </span>
                                                    <span className={style.sum}> ={item.quantity * item.unitPrice}</span>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                    <div className={style.totalRow}>
                                        <span className={style.totalValue}>Итого: {customer.totalSum}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            })}
            <h3 className={style.customerName}>Итого:</h3>
            <span className={style.totalValue}>Кол: {totalPositions} / </span>
            <span className={style.totalValue}>Сумма: {totalSum}</span>
        </div>
    );
};

export default InProgressReportByCustomer;