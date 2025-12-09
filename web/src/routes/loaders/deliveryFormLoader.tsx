import type { DeliveryDto } from "@warehouse/interfaces/DTO";
import { fetchApi } from "../../api/fetchApi";

export const deliveryFormLoader = async ({ params } : { params: { id?: string } }) => {
    const { id } = params;
    console.log('id=', id);
    
    if (id) {
        try {
            const delivery: DeliveryDto = await fetchApi(`delivery/${id}`, 'GET')
            console.log( 'delivery=', delivery);
            
            return { delivery }
        } catch (error) {
            throw error
        }
    } else {
        const docStatusDelivery = await fetchApi('doc/status/InDelivery', 'GET')
        
        const date = new Date().getTime();
        const startTime = new Date().setHours(10, 0, 0);
        const unloadTime = new Date().setHours(0, 5, 0);
        const timeInProgress = new Date().setHours(0, 10, 0);
        
        const delivery: DeliveryDto = { 
            deliveryDoc: {
                date: new Date(date),
                startTime: new Date(startTime),
                unloadTime: new Date(unloadTime),
                timeInProgress: new Date(timeInProgress),
                totalCountDoc: 0,
                totalCountEntity: 0,
                totalSum: 0
            },
            deliveryItems: []
        }
        // console.log(delivery);
        
        return { delivery, docStatusDelivery }
    }
}