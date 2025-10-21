// components/AddressManager.tsx
import { THEME } from '@warehouse/interfaces/config';
import type { IAddress } from '@warehouse/interfaces';
import { Button } from '../../../shared/Button';
import { TextField } from '../../../shared/TextFields';
import { fetchApi } from '../../../api/fetchApi';

interface AddressManagerProps {
  customerId: string | undefined; // undefined при создании нового клиента
  addresses: IAddress[];
  onSave: (addresses: IAddress[]) => void;
}

export default function AddressManager({ customerId, onSave, addresses }: AddressManagerProps) {

  const addAddress = () => {
    const newAddress: IAddress = {
      main: addresses.length === 0, // первый — основной
      customerId: customerId || '',
      address: '',
      gps: '',
      description: ''
    };
    onSave([...addresses, newAddress]);
  };

  const updateAddress = (index: number, field: keyof IAddress, value: string | boolean) => {
    const updated = [...addresses];
    updated[index] = { ...updated[index], [field]: value };

    // Если ставим main = true — снимаем у других
    if (field === 'main' && value === true) {
      updated.forEach((addr, i) => {
        if (i !== index) addr.main = false;
      });
    }
    // setAddresses(updated);
    onSave(updated);
  };

  const removeAddress = async (index: number) => {
    const updated = addresses.filter((_, i) => i !== index);
    // Если удалили основной — назначаем новый (первый)
    if (updated.length > 0 && !updated.some(a => a.main)) {
      updated[0].main = true;
    }
    // setAddresses(updated);
    onSave(updated);
    await fetchApi(`address/${addresses[index]._id}`, 'DELETE');
  };

  // if (loading) return <div>Загрузка адресов...</div>;

  return (
    <div style={{ marginTop: '20px', padding: '16px', border: '1px solid #eee', borderRadius: '8px' }}>
      <h3>Адреса доставки</h3>

      {/* Список существующих адресов */}
      {addresses.map((addr, index) => (
        <div
          key={index}
          style={{
            marginBottom: '16px',
            padding: '12px',
            background: '#f9f9f9',
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="checkbox"
                checked={addr.main}
                onChange={(e) => updateAddress(index, 'main', e.target.checked)}
              />
              Основной
            </label>
            <Button
              onClick={() => removeAddress(index)}
              bgColor={THEME.button.delete}
              textColor="#fff"
              text="Удалить"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <TextField
              type='text'
              name="address"
              value={addr.address}
              onChange={(e) => updateAddress(index, 'address', e.target.value)}
              placeholder="Адрес"
            />
            <TextField
              name="gps"
              value={addr.gps}
              onChange={(e) => updateAddress(index, 'gps', e.target.value)}
              placeholder="GPS (напр., 55.7558,37.6176)"
            />
            <TextField
              name="description"
              value={addr.description}
              onChange={(e) => updateAddress(index, 'description', e.target.value)}
              placeholder="Описание (офис, склад и т.д.)"
            />
          </div>
        </div>
      ))}

      {/* Кнопка "Добавить адрес" — всегда внизу */}
      <Button
        onClick={addAddress}
        bgColor={THEME.button.apply}
        textColor="#fff"
        text={addresses.length === 0 ? "Добавить первый адрес" : "Добавить ещё адрес"}
      />
    </div>
  );
}