import type { IProduct } from '@warehouse/interfaces';
import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import style from './InProgressreportByCustomer.module.css';

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

    const toggleCustomer = (customerId: string) => {
        setExpandedCustomers(prev => ({ ...prev, [customerId]: !prev[customerId] }));
    };

    return (
        <div className={style.reportContainer}>
            {data.map(customer => (
                <div
                    key={customer.customerId}
                    className={`${style.customerContainer} ${expandedCustomers[customer.customerId] ? style.expanded : ''
                        }`}
                >
                    <div
                        className={style.customerHeader}
                        onClick={() => toggleCustomer(customer.customerId)}
                    >
                        <h3>{customer.customerName}</h3>
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
            ))}
        </div>
    );
};

export default InProgressReportByCustomer;