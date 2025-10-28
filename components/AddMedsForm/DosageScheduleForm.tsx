import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NAV_THEME } from '../../constants';
import { FormStepProps } from './types';

export const DosageScheduleForm: React.FC<FormStepProps> = ({ 
  values, 
  errors, 
  touched, 
  setFieldValue 
}) => {
  const [selectedFrequency, setSelectedFrequency] = useState(values.frequency);

  const updateFrequency = (index: number, change: number) => {
    const newFrequency = [...selectedFrequency];
    newFrequency[index] = {
      ...newFrequency[index],
      tablets: Math.max(0, newFrequency[index].tablets + change)
    };
    setSelectedFrequency(newFrequency);
    setFieldValue('frequency', newFrequency);
  };

  return (
    <View style={styles.formContainer}>
      {/* Dose */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: NAV_THEME.dark.text }]}>Dose (mg)</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: NAV_THEME.dark.card, 
            color: NAV_THEME.dark.text, 
            borderColor: NAV_THEME.dark.border 
          }]}
          placeholder="Enter dose in mg"
          placeholderTextColor="#9ca3af"
          value={values.dose_in_mg}
          onChangeText={(text) => setFieldValue('dose_in_mg', text)}
          keyboardType="numeric"
        />
        {touched.dose_in_mg && errors.dose_in_mg && (
          <Text style={styles.errorText}>{errors.dose_in_mg}</Text>
        )}
      </View>

      {/* Quantity */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: NAV_THEME.dark.text }]}>Quantity</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: NAV_THEME.dark.card, 
            color: NAV_THEME.dark.text, 
            borderColor: NAV_THEME.dark.border 
          }]}
          placeholder="Enter quantity"
          placeholderTextColor="#9ca3af"
          value={values.quantity}
          onChangeText={(text) => setFieldValue('quantity', text)}
        />
        {touched.quantity && errors.quantity && (
          <Text style={styles.errorText}>{errors.quantity}</Text>
        )}
      </View>

      {/* Frequency Schedule */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: NAV_THEME.dark.text }]}>Daily Schedule</Text>
        <Text style={[styles.subLabel, { color: '#9ca3af' }]}>
          Set how many tablets to take at each time
        </Text>
        
        <View style={[styles.scheduleContainer, { 
          backgroundColor: NAV_THEME.dark.card,
          borderColor: NAV_THEME.dark.border 
        }]}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {selectedFrequency.map((timeSlot: any, index: number) => (
              <View key={index} style={styles.frequencyRow}>
                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, { color: NAV_THEME.dark.text }]}>
                    {timeSlot.time}
                  </Text>
                </View>
                
                <View style={styles.frequencyControls}>
                  <TouchableOpacity
                    style={[styles.frequencyButton, { 
                      backgroundColor: NAV_THEME.dark.background,
                      borderColor: NAV_THEME.dark.border
                    }]}
                    onPress={() => updateFrequency(index, -1)}
                  >
                    <AntDesign name="minus" size={16} color={NAV_THEME.dark.primary} />
                  </TouchableOpacity>
                  
                  <View style={[styles.countContainer, { 
                    backgroundColor: timeSlot.tablets > 0 ? NAV_THEME.dark.primary : NAV_THEME.dark.background,
                    borderColor: NAV_THEME.dark.border
                  }]}>
                    <Text style={[styles.frequencyCount, { 
                      color: timeSlot.tablets > 0 ? '#fff' : NAV_THEME.dark.text 
                    }]}>
                      {timeSlot.tablets}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.frequencyButton, { 
                      backgroundColor: NAV_THEME.dark.background,
                      borderColor: NAV_THEME.dark.border
                    }]}
                    onPress={() => updateFrequency(index, 1)}
                  >
                    <AntDesign name="plus" size={16} color={NAV_THEME.dark.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
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
    fontWeight: '300',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 12,
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
  scheduleContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    maxHeight: 200,
  },
  scrollView: {
    maxHeight: 150,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomColor: NAV_THEME.dark.border,
    borderBottomWidth: 1,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  frequencyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  frequencyButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countContainer: {
    borderWidth: 1,
    borderRadius: 8,
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequencyCount: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});