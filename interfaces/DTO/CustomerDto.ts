import type { ICustomer } from "../ICustomer.js";

export interface CustomerDto extends Omit<ICustomer, 'accountManager'> {
    accountManager: {_id: string, name: string}
}