import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useEffect, useState } from 'react';
import { fetchApi } from '../../../../utils';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { DocStackParamList } from '../../../../types/types';
import { EditableItem } from '../EditableItem';
import HeaderForm from './HeaderForm';
import { DocDto, DocItemDto, DocOrderDto } from '@warehouse/interfaces/DTO';

type DocFormRouteProps = RouteProp<DocStackParamList, 'DocForm'>;


const DocForm = () => {
  const route = useRoute<DocFormRouteProps>();
  const navigation = useNavigation();
  const { docId } = route.params || '';

  // Данные с сервера
  const [doc, setDoc] = useState<DocDto | null>(null);
  const [items, setItems] = useState<DocItemDto[]>([]);

  // Режим редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const docNew: DocOrderDto = {
    docNum: '',
    docDate: new Date(),
    bonusRef: 0,
    expenses: 0,
    orderNum: '',
    priority: 'Low',
    docType: 'Order',
    status: 'Draft',
    customerId: { _id: '', name: '' },
    description: '',
  };


  useEffect(() => {
    if (!docId) {
      setDoc(docNew);
      setLoading(false);
    }
    else loadDoc()
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

  const footer = () => {
    return (
      <View style={[styles.footer]}>
        <Text style={styles.total}>
          Всего: {items.reduce((sum, i) => sum + i.quantity, 0)} шт. Сумма: {items.reduce((sum, i) => 
            sum + i.quantity * (i.unitPrice - (i.bonusStock || 0)), 0).toFixed(0)} ₽
        </Text>
      </View>
    );
  };

  return (

    <View style={[styles.content]}>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id!}
        ListHeaderComponent={
          <HeaderForm
            doc={doc}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleDelete={handleDelete}
            setDoc={setDoc}
            handleSave={handleSave}
          />
        }
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
                <Text>Скидка: {item.bonusStock?.toFixed(0)} ₽</Text>
                <Text>Сумма: {(item.quantity * (item.unitPrice - (item.bonusStock || 0))).toFixed(0)} ₽</Text>
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


export default DocForm;

// Стили
const styles = StyleSheet.create({
  content: { padding: 16 },
  detailsRow: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#d32f2f' },
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
})