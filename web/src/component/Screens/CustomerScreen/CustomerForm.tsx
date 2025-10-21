import { useState } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useParams } from 'react-router-dom';
import style from './CustomerForm.module.css';
import type { IAddress, ICustomer } from '@warehouse/interfaces';
import { TextField, type InputType } from '../../../shared/TextFields/UI/TextField';
import { Button } from '../../../shared/Button';
import { THEME } from '@warehouse/interfaces/config';
import AddressManager from './AddressManager';

interface FieldProps {
  label: string;
  name: keyof ICustomer;
  type: InputType
}

const fields: FieldProps[] = [
  { label: 'Имя', name: 'name', type: 'text' },
  { label: 'Телефон', name: 'phone', type: 'tel' },
  { label: 'Email', name: 'email', type: 'email' },
  // { label: 'Адрес доставки', name: 'address', type: 'text' },
  // { label: 'GPS', name: 'gps', type: 'text' },
  { label: 'Контактное лицо', name: 'contactPerson', type: 'text' },
  { label: 'Телефон контактного лица', name: 'contactPersonPhone', type: 'tel' },
  { label: 'Описание', name: 'description', type: 'textarea',  },
  { label: 'Скидка (%)', name: 'percent', type: 'number' },
];

export default function CustomerForm() {
  const { customerId: id } = useParams<{ customerId?: string }>();
  const { customer, addresses } = useLoaderData<{ customer: ICustomer, addresses: IAddress[] }>();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Синхронизируем состояние с данными из loader (для редактирования)
  const [formData, setFormData] = useState<ICustomerAndAddress>({ customer, addresses: addresses || [] });

  console.log(formData);
  
  // Если форма отправлена успешно — можно сбросить или перейти назад
  // (но обычно переход делает redirect из action)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    // Для числовых полей преобразуем в число
    const newValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setFormData((prev) => ({ ...prev, customer: { ...prev.customer, [name]: newValue } }));
  };

  return (
    <Form method="post" action={`/customer`} className={style.clientFormContainer}>
      {/* Скрытые поля для передачи данных в action */}
      {id && <input type="hidden" name="id" value={id} />}
      <input type="hidden" name="customer" value={JSON.stringify(formData.customer)} />
      <input type="hidden" name="addresses" value={JSON.stringify(formData.addresses)} />

      <h2>{id ? 'Редактировать клиента' : 'Создать клиента'}</h2>

      {actionData?.error && (
        <p style={{ color: 'red', marginBottom: '16px' }}>{actionData.error}</p>
      )}

      {fields.map((field) => (
        <div key={field.name} style={{ marginBottom: '12px' }}>
          <TextField
            type={field.type}
            name={field.name}
            value={formData.customer[field.name] ?? ''}
            onChange={handleChange}
            placeholder={field.label}
            // Отключаем при отправке
            // disabled={isSubmitting}
          />
        </div>
      ))}

      {/* Управление адресами */}
      <AddressManager customerId={id} addresses={formData.addresses} onSave={(addresses) => setFormData((prev) => ({ ...prev, addresses }))} />

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <Button
          type="submit"
          name='_method'
          value={id ? 'PATCH' : 'POST'}
          bgColor={THEME.button.apply}
          textColor="#fff"
          text={id ? 'Обновить' : 'Создать'}
          disabled={isSubmitting}
        />
        {id && (
            <Button
              type="submit"
              name='_method'
              value='DELETE'
              bgColor={THEME.button.delete}
              textColor="#fff"
              text="Удалить"
              disabled={isSubmitting}
              onClick={(e) => {
                if (!window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
                  e.preventDefault();
                }
              }}
            />
        )}
        <Button
          type="button"
          onClick={() => window.history.back()}
          bgColor={THEME.button.cancel}
          textColor="#fff"
          text="Назад"
        />
      </div>
    </Form>
  );
}