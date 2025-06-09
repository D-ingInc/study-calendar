// src/components/common/ModalPicker.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface PickerOption {
  label: string;
  value: any;
}

interface ModalPickerProps {
  label: string;
  selectedValue: any;
  onValueChange: (value: any) => void;
  options: PickerOption[];
  placeholder?: string;
  style?: any;
}

export const ModalPicker: React.FC<ModalPickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
  placeholder = "選択してください",
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tempValue, setTempValue] = useState(selectedValue);

  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleConfirm = () => {
    onValueChange(tempValue);
    setIsVisible(false);
  };

  const handleCancel = () => {
    setTempValue(selectedValue);
    setIsVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => {
          setTempValue(selectedValue);
          setIsVisible(true);
        }}
      >
        <Text style={[
          styles.inputText,
          !selectedOption && styles.placeholder
        ]}>
          {displayText}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={handleConfirm} style={styles.modalButton}>
                <Text style={[styles.modalButtonText, styles.doneText]}>完了</Text>
              </TouchableOpacity>
            </View>
            
            {Platform.OS === 'ios' ? (
              <Picker
                selectedValue={tempValue}
                onValueChange={setTempValue}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {options.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            ) : (
              <ScrollView style={styles.androidList}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.androidOption,
                      tempValue === option.value && styles.androidOptionSelected
                    ]}
                    onPress={() => setTempValue(option.value)}
                  >
                    <Text style={[
                      styles.androidOptionText,
                      tempValue === option.value && styles.androidOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    minHeight: 50,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  arrow: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  doneText: {
    fontWeight: '600',
  },
  picker: {
    height: 216,
    marginHorizontal: 20,
  },
  pickerItem: {
    fontSize: 18,
    color: '#333',
  },
  androidList: {
    maxHeight: 300,
  },
  androidOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  androidOptionSelected: {
    backgroundColor: '#007AFF10',
  },
  androidOptionText: {
    fontSize: 16,
    color: '#333',
  },
  androidOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});