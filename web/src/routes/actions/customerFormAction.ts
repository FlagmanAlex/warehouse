import { redirect } from "react-router-dom";
import { fetchApi } from "../../api/fetchApi";
import type { ICustomer } from "@warehouse/interfaces";

export const customerAction = async ({ request }: { request: Request }) => {
    // ✅ Убрали аннотацию : FormData
    const formData: any = await request.formData();

    const customerStr = formData.get('customer');
    const addressesStr = formData.get('addresses');
    console.log(addressesStr);
    
    const id = formData.get('id');
    const _method = formData.get('_method');

    if (typeof customerStr !== 'string') {
        return { error: 'Invalid form data: "customer" must be a string' };
    }

    let customerData;
    let addressesData;
    try {
        customerData = JSON.parse(customerStr);
        addressesData = JSON.parse(addressesStr);
    } catch (error) {
        console.error('Failed to parse customer JSON:', customerStr, error);
        return { error: 'Invalid JSON in form data' };
    }
    console.log(addressesData);
    
    try {

        switch (_method) {
            case 'PATCH':
                await fetchApi(`customer/${id}`, 'PATCH', { customer: customerData });
                await fetchApi(`address/${id}`, 'PATCH', { addresses: addressesData });
                return redirect('/customers');
            case 'POST':
                {
                    const response: ICustomer = await fetchApi('customer', 'POST', { customer: customerData })
                    await fetchApi(`address/${response._id}`, 'POST', { addresses: addressesData });
                    return redirect('/customers');
                }
            case 'DELETE':
                await fetchApi(`customer/${id}`, 'DELETE');
                return redirect('/customers');
            default:
                return { error: 'Invalid _method' };
        }

    } catch (error) {
        console.error('Customer save error:', error);
        return { error: (error as Error).message || 'Failed to save customer' };
    }
};