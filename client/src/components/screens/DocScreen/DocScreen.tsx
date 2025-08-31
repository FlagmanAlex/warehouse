// components/OrderList.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';


import Icon from 'react-native-vector-icons/FontAwesome5';

import { fetchApi } from '../../../utils';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DocStackParamList } from 'src/types/types';
import { TextField } from 'src/shared/TextField';
import { DatePicker } from 'src/shared/DatePicker';
import StatusIcon from './StatusIcon';
import { DOC_TYPE, DOCSTATUS_CHIP, DOCTYPE_CHIP } from 'src/utils/statusLabels';
import { Button } from 'src/shared/Button';
import { getStatusColor } from 'src/utils/iconName';
import { DocStatus } from '@warehouse/interfaces';
import { DocDto } from '@warehouse/interfaces/DTO'
import { THEME } from 'src/Default';

export const DocScreen = () => {

  const navigation = useNavigation<StackNavigationProp<DocStackParamList>>();

  const [doc, setDoc] = useState<DocDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterShow, setFilterShow] = useState(false);

  // Для фильтрации по дате
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());

  //Для фильтрации
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  //Поиск по клиенту/поставщику
  const [searchQuery, setSearchQuery] = useState<string>('');

  //Маппинг customerId и supplierId
  const customerMap = new Map<string, string>();
  const supplierMap = new Map<string, string>();

  // Загрузка всех документов
  useEffect(() => {
    fetchDocs(true);
  }, [startDate, endDate]);

  const fetchDocs = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {

      const docs: DocDto[] = await fetchApi(
        `doc?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        'GET',
      );
      setDoc(docs);

    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const handleDeleteDoc = async (docId: string) => {
    Alert.alert(
      'Подтвердите удаление',
      'Вы уверены, что хотите удалить этот документ?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              await fetchApi(
                `doc/${docId}`,
                'DELETE',
                {},
              );
            } catch (error) {
              console.error('Ошибка удаления документа:', error);
            }
          },
        },
      ]
    );
  };


  // Фильтрация документов
  const filteredDocs = doc.filter((item) => {
    // Фильтр по дате — уже на сервере, но можно уточнить
    const itemDate = new Date(item.docDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (itemDate < start || itemDate > end) return false;

    // Фильтр по типу
    if (selectedDocType && item.docType !== selectedDocType) return false;

    if (selectedStatus && item.status !== selectedStatus) return false;

    // Поиск по клиенту или поставщику
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const customerMatch = item.docType === 'Outgoing' && item.customerId?.name.toLowerCase().includes(query);
      const supplierMatch = item.docType === 'Incoming' && item.supplierId?.name.toLowerCase().includes(query);
      if (!customerMatch && !supplierMatch) return false;
    }

    return true;
  });


  // В DocScreen.tsx, в функции renderItem:

  const renderItem = ({ item }: { item: DocDto }) => (
    <View style={styles.docCard}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => navigation.navigate('DocForm', { docId: item._id!, docType: item.docType })}
      >
        <View style={styles.row}>
          <Text style={styles.subtitle}>№{item.docNum}</Text>
          <Text style={item.docType === 'Outgoing' ?
            [styles.subtitle, { color: '#008000' }] :
            [styles.subtitle, { color: '#ff0000' }]}
          >
            {DOC_TYPE[item.docType]}
          </Text>
          <Text style={styles.subtitle}>Дата: {new Date(item.docDate).toLocaleDateString()}</Text>

          {/* Передаём docId и onStatusChange */}

          <StatusIcon
            status={item.status}
            docId={item._id!}
            onStatusChange={(newStatus) => {
              setDoc((prev) =>
                prev.map((doc) =>
                  doc._id === item._id ? { ...doc, status: newStatus } : doc
                )
              );
            }}
          />
        </View>

        {(item.docType === 'Incoming') && <Text style={styles.subtitle}>Поставщик: {item.supplierId?.name}</Text>}
        {(item.docType === 'Outgoing') && <Text style={styles.subtitle}>Клиент: {item.customerId?.name}</Text>}

        <Text selectable>ID документа: {item._id}</Text>
      </TouchableOpacity>
    </View>
  )


  return (
    <View style={styles.container}>


      {/* Контроллеры выбора дат */}
      <View style={styles.datePickers}>
        <DatePicker
          date={startDate}
          setDate={(date) => setStartDate(new Date(date))}
        />

        <Button
          onPress={() => setFilterShow(!filterShow)}
          bgColor={filterShow ? '#f0f0f0' : '#fff'}
          textColor='#007bff'
        >
          <Icon size={24} name={filterShow ? "caret-up" : "caret-down"} />
        </Button>

        <DatePicker
          date={endDate}
          setDate={(date) => setEndDate(new Date(date))}
        />
      </View>

      {/* Фильтр по типу документа */}
      {filterShow && (
        <>
          <View style={styles.filterRow}>
            {Object.keys(DOCTYPE_CHIP).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  selectedDocType === type && type !== null && styles.chipSelected,
                  selectedDocType === type && type === null && styles.chipAllSelected,
                ]}
                onPress={() => setSelectedDocType(type === selectedDocType ? null : type)}
              >
                <Icon
                  name={DOCTYPE_CHIP[type as keyof typeof DOCTYPE_CHIP]}
                  size={24}
                  color="#333"

                />
              </TouchableOpacity>
            ))}
          </View>
          {/* Фильтр по статусу документа */}
          <View style={styles.filterRow}>
            {Object.keys(DOCSTATUS_CHIP).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.chip,
                  selectedStatus === status && styles.chipSelected,
                  selectedStatus === status && status === null && styles.chipAllSelected
                ]}
                onPress={() => setSelectedStatus(status === selectedStatus ? null : status)}
              >
                <Icon
                  name={DOCSTATUS_CHIP[status as keyof typeof DOCSTATUS_CHIP]}
                  size={24}
                  color={getStatusColor(status as DocStatus)}
                />
              </TouchableOpacity>
            ))}
          </View>
          {/* Поиск по клиенту или поставщику */}
          <View style={styles.searchContainer}>
            <TextField
              placeholder="Поиск по клиенту или поставщику"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Button
            bgColor={THEME.button.add}
            textColor={THEME.color.white}
            onPress={() => navigation.navigate('DocForm', { docId: '', docType: selectedDocType || 'Outgoing' })}
          >
            <Text><Icon name="plus" size={24} /></Text>
          </Button>
        </>
      )}



      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredDocs}
          keyExtractor={(item) => item._id!}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={() => fetchDocs(false)}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  datePickers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  chipSelected: {
    backgroundColor: '#d3e8ff',
    borderColor: '#007BFF',
  },
  chipAllSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  chipText: {
    color: '#333',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  docCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  detailContainer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  detailRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#007BFF',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
});