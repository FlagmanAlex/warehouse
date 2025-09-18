import { useRouteError, type ErrorResponse } from 'react-router-dom'

export const ErrorPage = () => {

    const error = useRouteError() as ErrorResponse | Error

    console.log(error);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
            }}
        >
            <h1>🚨 Упс! Что-то пошло не так.</h1>
            <p>Извините, произошла ошибка при загрузке страницы.</p>

            {import.meta.env.DEV && (
                <div
                    style={{
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        color: '#856404',
                        maxWidth: '600px',
                    }}
                >
                    <strong>Информация для разработчика:</strong>
                    <pre
                        style={{
                            marginTop: '10px',
                            padding: '10px',
                            backgroundColor: '#fefefe',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            overflow: 'auto',
                            textAlign: 'left',
                        }}
                    >
                        {error instanceof Error
                            ? error.stack
                            : typeof error === 'object' && error !== null
                                ? JSON.stringify(error, null, 2)
                                : String(error)}
                    </pre>
                </div>
            )}

            <button
                onClick={() => window.location.reload()}
                style={{
                    marginTop: '30px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Обновить страницу
            </button>
        </div>
    )
}