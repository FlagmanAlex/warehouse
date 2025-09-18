// src/component/screens/NotFoundPage.tsx
export const NotFoundPage = () => {
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
      <h1>🔍 404 — Страница не найдена</h1>
      <p>К сожалению, страница, которую вы ищете, не существует.</p>
      <a
        href="/"
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#28a745',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
        }}
      >
        Вернуться на главную
      </a>
    </div>
  );
}