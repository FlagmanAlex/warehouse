interface CustomerFormProps {
    initialData?: ICustomer
    onSubmit: (data: ICustomer) => void
    isSubmitting: boolean
}