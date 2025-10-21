interface ICustomerAndAddress {
    customer: ICustomer
    addresses: IAddress[]
    
}
interface CustomerFormProps {
    initialData?: ICustomerAndAddress
    onSubmit: (data: ICustomerAndAddress) => void
    isSubmitting: boolean
}