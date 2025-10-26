import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NAV_THEME } from '../../constants';
import { medicineFormOptions } from './constants';
import { FormStepProps } from './types';

export const MedicineDetailsForm: React.FC<FormStepProps> = ({ 
  values, 
  errors, 
  touched, 
  setFieldValue 
}) => {
  return (
    <View style={styles.formContainer}>
      {/* Medicine Name */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: NAV_THEME.dark.text }]}>Medicine Name</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: NAV_THEME.dark.card, 
            color: NAV_THEME.dark.text, 
            borderColor: NAV_THEME.dark.border 
          }]}
          placeholder="Enter medicine name"
          placeholderTextColor="#9ca3af"
          value={values.medicine}
          onChangeText={(text) => setFieldValue('medicine', text)}
        />
        {touched.medicine && errors.medicine && (
          <Text style={styles.errorText}>{errors.medicine}</Text>
        )}
      </View>

      {/* Medicine Form */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: NAV_THEME.dark.text }]}>Medicine Form</Text>
        <View style={styles.formGrid}>
          {medicineFormOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.formButton,
                {
                  backgroundColor: values.form === item.title ? NAV_THEME.dark.primary : NAV_THEME.dark.card,
                  borderColor: NAV_THEME.dark.border,
                }
              ]}
              onPress={() => setFieldValue('form', item.title)}
            >
              <MaterialCommunityIcons 
                name={item.iconName as any} 
                size={24} 
                color={values.form === item.title ? '#fff' : NAV_THEME.dark.primary}
              />
              <Text style={[
                styles.formText,
                { color: values.form === item.title ? '#fff' : NAV_THEME.dark.text }
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {touched.form && errors.form && (
          <Text style={styles.errorText}>{errors.form}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: '30%',
    minHeight: 80,
  },
  formText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});