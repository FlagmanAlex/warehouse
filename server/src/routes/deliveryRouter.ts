import { DeliveryController } from "@controllers";
import { Router } from "express";

export const deliveryRouter = Router();

deliveryRouter.get('/', DeliveryController.getDocDeliveries)
deliveryRouter.post('/', DeliveryController.createDelivery)
deliveryRouter.delete('/:deliveryId', DeliveryController.deleteDelivery)
deliveryRouter.get('/:deliveryId', DeliveryController.getDeliveryForId)