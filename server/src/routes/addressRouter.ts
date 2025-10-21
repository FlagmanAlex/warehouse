import { addressController } from "@controllers";
import { Router } from "express";

export const addressRouter = Router();

addressRouter.get("/:customerId", addressController.getAllAddressFromCustomerId);

addressRouter.post("/:customerId", addressController.createAddress);

addressRouter.get("/:id", addressController.getAddressById);

addressRouter.patch("/:customerId", addressController.updateAddressesByCustomerId);

addressRouter.delete("/:id", addressController.deleteAddress);
