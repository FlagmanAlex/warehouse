// components/StatusIcon.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { fetchApi } from '../../../utils';
import { DocStatus, DocStatusOut } from '@warehouse/interfaces';
import { DOC_STATUS_OUT } from 'src/utils/statusLabels';
import { getIconName, getStatusColor } from 'src/utils/iconName';

// Допустимые переходы между статусами
const STATUS_TRANSITIONS: Record<DocStatusOut, DocStatusOut[]> = {
  Draft: ['Reserved', 'Canceled'],
  Reserved: ['Shipped', 'Canceled'],
  Shipped: ['Completed', 'Canceled'],
  Completed: [],
  Canceled: [],
};

type StatusIconProps = {
  status: DocStatus;
  docId: string;
  onStatusChange: (newStatus: DocStatus) => void; // Колбэк для обновления в родителе
};

const StatusIcon = ({ status, docId, onStatusChange }: StatusIconProps) => {
  const [modalVisible, setModalVisible] = useState(false);


  const availableStatuses = STATUS_TRANSITIONS[status as DocStatusOut] || [];

  const handleStatusChange = async (newStatus: DocStatus) => {
    try {
      await fetchApi(`doc/${docId}/status`, 'PUT', {
        status: newStatus,
      });

      onStatusChange(newStatus); // Обновляем в UI
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось изменить статус');
      console.error('Ошибка обновления статуса:', error);
    }
  };

  return (
    <>
      {/* Иконка статуса */}
      <TouchableOpacity onPress={() => availableStatuses.length > 0 ? setModalVisible(true) : null}>
        <Icon
          name={getIconName(status)}
          color={getStatusColor(status)}
          size={30}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Модальное окно */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Изменить статус</Text>

                {availableStatuses.length === 0 ? (
                  <Text style={styles.noOptions}>Нет доступных действий</Text>
                ) : (
                  availableStatuses.map((s: DocStatusOut) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusOption,
                        s === 'Canceled' && styles.cancelOption,
                      ]}
                      onPress={() => handleStatusChange(s)}
                    >
                      <Icon
                        name={getIconName(s)}
                        color={getStatusColor(s)}
                        size={20}
                        style={styles.optionIcon}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          { color: getStatusColor(s) },
                        ]}
                      >
                        {DOC_STATUS_OUT[s]}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default StatusIcon;

const styles = StyleSheet.create({
  icon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#f5f5f5',
    minWidth: '100%',
    justifyContent: 'center',
  },
  cancelOption: {
    backgroundColor: '#ffebee',
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noOptions: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});