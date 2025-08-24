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


import { ResponseDocDto } from '@interfaces/DTO'

import Icon from 'react-native-vector-icons/Fontisto'
import { fetchApi } from '../../../utils';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DocStackParamList } from 'src/types/types';
import { TextField } from 'src/shared/TextField';
import { DatePicker } from 'src/shared/DatePicker';
import StatusIcon from './StatusIcon';
import { DOC_TYPE, DOCTYPE_CHIP } from 'src/utils/statusLabels';

export const DocScreen = () => {

  const navigation = useNavigation<StackNavigationProp<DocStackParamList>>();

  const [doc, setDoc] = useState<ResponseDocDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Для фильтрации по дате
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());

  //Для фильтрации по типу документа
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  //Поиск по клиенту/поставщику
  const [searchQuery, setSearchQuery] = useState<string>('');

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

      const docs: ResponseDocDto[] = await fetchApi(
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

  // const onDateChange = (event: any, selectedDate: Date | undefined, isStart: boolean) => {
  //   if (selectedDate) {
  //     if (isStart) {
  //       setStartDate(selectedDate);
  //     } else {
  //       setEndDate(selectedDate);
  //     }
  //   }
  //   fetchDocs(true);
  // };

  // Фильтрация документов
  const filteredDocs = doc.filter((item) => {
    // Фильтр по дате — уже на сервере, но можно уточнить
    const itemDate = new Date(item.docDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (itemDate < start || itemDate > end) return false;

    // Фильтр по типу
    if (selectedDocType && item.docType !== selectedDocType) return false;

    // Поиск по клиенту или поставщику
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const customerMatch = item.customerId?.name.toLowerCase().includes(query);
      const supplierMatch = item.supplierId?.name.toLowerCase().includes(query);
      if (!customerMatch && !supplierMatch) return false;
    }

    return true;
  });

  // В DocScreen.tsx, в функции renderItem:

  const renderItem = ({ item }: { item: ResponseDocDto }) => (
    <View style={styles.docCard}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => navigation.navigate('DocForm', { docId: item._id })}
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
            docId={item._id}
            onStatusChange={(newStatus) => {
              setDoc((prev) =>
                prev.map((doc) =>
                  doc._id === item._id ? { ...doc, status: newStatus } : doc
                )
              );
            }}
          />
        </View>

        {item.customerId ? (
          <Text style={styles.subtitle}>Клиент: {item.customerId.name}</Text>
        ) : (
          <Text style={styles.subtitle}>Поставщик: {item?.supplierId?.name || '—'}</Text>
        )}

        <Text selectable>ID документа: {item._id}</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.container}>


      {/* Контроллеры выбора дат */}
      <View style={styles.datePickers}>
        <DatePicker
          date={startDate}
          setDate={(date) => setStartDate(new Date(date))}
        />

        <DatePicker
          date={endDate}
          setDate={(date) => setEndDate(new Date(date))}
        />
        {/* <TouchableOpacity onPress={() => showDatePicker(true)}>
          <Text>{startDate ? startDate.toLocaleDateString() : 'Выберите начальную дату'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => showDatePicker(false)}>
          <Text>{endDate ? endDate.toLocaleDateString() : 'Выберите конечную дату'}</Text>
        </TouchableOpacity> */}
      </View>

      {/* {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => onDateChange(e, date, true)}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => onDateChange(e, date, false)}
        />
      )} */}

      {/* Фильтр по типу документа */}
      <View style={styles.filterRow}>
        <View style={styles.chipContainer}>
          {Object.keys(DOCTYPE_CHIP).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip, styles.chipContainer,
                selectedDocType === type && type !== 'Все' && styles.chipSelected,
              ]}
              onPress={() => setSelectedDocType(type === 'Все' ? null : type)}
            >
                <Icon
                  name={DOCTYPE_CHIP[type as keyof typeof DOCTYPE_CHIP]}
                  size={20}

                />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* <Dropdown
        data={[
          { label: 'Все', value: null },
          { label: 'Приход', value: 'Приход' },
          { label: 'Расход', value: 'Расход' },
          { label: 'Перемещение', value: 'Перемещение' }
        ]}
        labelField="label"
        valueField="value"
        placeholder="Выберите тип документа"
        value={selectedDocType}
        onChange={item => {
          setSelectedDocType(item.value);
        }}
      /> */}


      {/* Поиск по клиенту или поставщику */}
      <View style={styles.searchContainer}>
        <TextField
          // style={styles.searchInput}
          placeholder="Поиск по клиенту или поставщику"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredDocs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={() => fetchDocs(false)}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  datePickers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  docCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 4,
    color: '#555',
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

  filters: {
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    paddingHorizontal: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 50,
  },
  chipContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
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
  chipText: {
    color: '#333',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  chipAllSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },

});
