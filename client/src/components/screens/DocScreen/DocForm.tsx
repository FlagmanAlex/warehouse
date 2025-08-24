import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../utils';
import { ResponseDocDto, ResponseDocItemDto } from '@interfaces/DTO';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { DocStackParamList } from '../../../types/types';
import { Field } from './Field';
import { Button } from 'src/shared/Button';
import { EditableItem } from './EditableItem';
import { DocStatus, DocType } from '@interfaces';

type DocFormRouteProps = RouteProp<DocStackParamList, 'DocForm'>;


const DocForm = () => {
  const route = useRoute<DocFormRouteProps>();
  const navigation = useNavigation();
  const { docId } = route.params || {};

  // Данные с сервера
  const [doc, setDoc] = useState<ResponseDocDto | null>(null);
  const [items, setItems] = useState<ResponseDocItemDto[]>([]);

  // Режим редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDoc();
  }, [docId]);

  const loadDoc = async () => {
    if (!docId) return setError('ID не указан');

    try {
      setLoading(true);
      const data = await fetchApi(`doc/${docId}`, 'GET');
      setDoc(data.doc);
      setItems(data.items);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetchApi(`doc/${docId}`, 'PUT', { doc, items });
      setIsEditing(false);
      Alert.alert('Успех', 'Документ сохранён');
    } catch (err: any) {
      Alert.alert('Ошибка', err.message);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Удалить документ?',
      'Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          async onPress() {
            try {
              await fetchApi(`doc/${docId}`, 'DELETE');
              navigation.goBack();
              Alert.alert('Успешно', 'Документ удалён');
            } catch (err: any) {
              Alert.alert('Ошибка', err.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (error || !doc) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Ошибка: {error || 'Документ не найден'}</Text>
      </View>
    );
  }

  const header = () => {
    return (
      <View style={[styles.container]}>
        {/* Заголовок */}
        <View style={styles.actions}>
          {!isEditing ? (
            <View style={[styles.detailsRow, {flex: 1, justifyContent: 'space-between' }]}>
              <Button onPress={() => setIsEditing(true)} bgColor='#007bff' textColor='#fff' >Редактировать</Button>
              <Button onPress={handleDelete} bgColor="#d32f2f" textColor="#fff" >Удалить</Button>
            </View>
          ) : (
            <View style={[styles.detailsRow, {flex: 1, justifyContent: 'space-between' }]}>
              <Button onPress={handleSave} bgColor="#28a745" textColor="#fff" >Сохранить</Button>
              <Button onPress={() => setIsEditing(false)} bgColor="#6c757d" textColor="#fff" >Отмена</Button>
            </View>
          )}
        </View>
        {/* № документа */}        
        <Text style={[styles.title, { justifyContent: 'center' }]}>Документ №{doc.docNum}</Text>

        <View style={styles.header}>
        
          {/*Дата документа */}
          <Field
            label="Дата"
            value={doc.docDate}
            editable={isEditing}
            type='date'
            onChange={(val) => setDoc({ ...doc, docDate: new Date(val) })}
          />
          <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) }]}>
            {doc.status}
          </Text>
        </View>


        {/* Основные поля */}
        <View style={styles.card}>
          <Field
            label="Тип"
            value={doc.docType}
            editable={isEditing}
            onChange={(val) => setDoc({ ...doc, docType: val as DocType })}
            options={[
              { label: 'Приход', value: 'Приход' },
              { label: 'Расход', value: 'Расход' },
              { label: 'Перемещение', value: 'Перемещение' },
              { label: 'Списание', value: 'Списание' },
            ]}
          />
          <Field
            label="Статус"
            value={doc.status}
            editable={isEditing}
            onChange={(val) => setDoc({ ...doc, status: val as DocStatus })}
            options={[
              { label: 'Черновик', value: 'Черновик' },
              { label: 'Активен', value: 'Активен' },
              { label: 'В резерве', value: 'В резерве' },
              { label: 'Проведен', value: 'Проведен' },
              { label: 'Отменен', value: 'Отменен' },
            ]}
          />

          {doc.customerId ? (
            <Field label="Клиент" value={doc.customerId.name} editable={false} />
          ) : doc.supplierId ? (
            <Field label="Поставщик" value={doc.supplierId.name} editable={false} />
          ) : null}
        </View>

        {isEditing ? (
          <View style={styles.actions}>
              <Button bgColor='#28a745' textColor='#fff' onPress={() => Alert.alert('TODO: добавление')}>"+ Добавить позицию"</Button>
          </View>
        ) : null}

      </View>
    );
  };

  const footer = () => {
    return (
      <View style={[styles.footer]}>
        <Text style={styles.total}>
          Всего: {items.reduce((sum, i) => sum + i.quantity, 0)} шт. Сумма: {items.reduce((sum, i) => sum + i.quantity * (i.unitPrice - i.bonusStock), 0).toFixed(0)} ₽
        </Text>
      </View>
    );
  };

  return (

    <View style={[styles.content]}>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        renderItem={({ item }) =>
          isEditing ? (
            <EditableItem item={item} onUpdate={(updated) => setItems(items.map(i => i._id === item._id ? updated : i))} />
          ) : (
            <View style={styles.itemRow}>
              <Text style={styles.productName}>{item.productId.name}</Text>
              <View style={styles.detailsRow}>
                <Text>Кол-во: {item.quantity}</Text>
                <Text>Цена: {item.unitPrice.toFixed(0)} ₽</Text>
                <Text>Скидка: {item.bonusStock.toFixed(0)} ₽</Text>
                <Text>Сумма: {(item.quantity * (item.unitPrice  - item.bonusStock)).toFixed(0)} ₽</Text>
              </View>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={[styles.separator]} />}
        ListEmptyComponent={<Text style={styles.empty}>Нет позиций</Text>}
      />
    </View>

  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Завершен':
      return '#2e7d32';
    case 'Отменен':
      return '#c62828';
    case 'В резерве':
      return '#f57c00';
    default:
      return '#1976d2';
  }
};

export default DocForm;

// Стили
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#d32f2f' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontWeight: '600', color: '#555', width: 90 },
  value: { flex: 1, color: '#333' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  picker: { flexDirection: 'row', gap: 8, flex: 1 },
  option: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  optionSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  itemRow: { paddingVertical: 10 },
  productName: { fontSize: 16, fontWeight: '600', color: '#212121' },
  detailsRow: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  editRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 6,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  flex1: { flex: 1 },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  empty: { textAlign: 'center', color: '#999', padding: 12 },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a1a1a',
  },
});