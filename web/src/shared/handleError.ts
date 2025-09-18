export const handleError = (error: unknown) => {
    if (typeof error === 'string') console.log(error)
    else if (error instanceof Error) console.log(error.message)
    else console.log(error)
}