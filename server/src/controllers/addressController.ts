import { IAddress } from "@interfaces";
import { AddressModel } from "@models";
import { Request, Response } from "express";

export class addressController {
    static getAllAddressFromCustomerId = async (req: Request, res: Response) => {
        try {
            const addresses = await AddressModel.find({ customerId: req.params.customerId });
            res.status(200).json(addresses);
        } catch (error) {
            console.log("Ошибка при получении адресов:", error);
            res.status(500).json({ error: 'Ошибка при получении адресов' });
        }
    }
    static createAddress = async (req: Request, res: Response) => {
        try {

            const customerId = req.params.customerId;

            if (!customerId) {
                res.status(400).json({ error: 'ID клиента не указан' });
                return;
            }

            const { addresses } = req.body;
            for (const address of addresses) {
                const newAddress = new AddressModel({ ...address, customerId });
                await newAddress.save();
            }
            res.status(201).json(addresses);

        } catch (error) {
            console.log("Ошибка при создании адреса:", error);
            res.status(500).json({ error: 'Ошибка при создании адреса' });
        }
    }
    static getAddressById = async (req: Request, res: Response) => {
        try {
            const address = await AddressModel.findById(req.params.id);
            res.status(200).json(address);
        } catch (error) {
            console.log("Ошибка при получении адреса:", error);
            res.status(500).json({ error: 'Ошибка при получении адреса' });
        }
    }
    static updateAddressesByCustomerId = async (req: Request, res: Response) => {
        try {
            const customerId = req.params.customerId;
            await AddressModel.deleteMany({ customerId });
            const { addresses }: { addresses: IAddress[] } = req.body;
            console.log(req.body);

            addresses.forEach(async address => {
                const { customerId, main, ...rest } = address;
                await AddressModel.create({ customerId, main, ...rest });
            });

            res.status(200).json({ message: 'Адреса обновлены' });
        } catch (error) {
            console.log("Ошибка при обновлении адреса:", error);
            res.status(500).json({ error: 'Ошибка при обновлении адреса' });
        }
    }

    static deleteAddress = async (req: Request, res: Response) => {
        try {
            await AddressModel.findByIdAndDelete(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.log("Ошибка при удалении адреса:", error);
            res.status(500).json({ error: 'Ошибка при удалении адреса' });
        }
    }
}