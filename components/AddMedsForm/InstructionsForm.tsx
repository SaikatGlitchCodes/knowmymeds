import { AntDesign } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { NAV_THEME } from '../../constants';
import { FormStepProps } from './types';

export const InstructionsForm: React.FC<FormStepProps> = ({ 
  values, 
  errors,
  touched,
  setFieldValue 
}) => {
  const colorScheme = useColorScheme();
  const themeColor = NAV_THEME[colorScheme === "light" ? "light" : "dark"];

  // Helper function to format date from MM/DD/YYYY to YYYY-MM-DD
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Helper function to format date from YYYY-MM-DD to MM/DD/YYYY
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  const [startDate, setStartDate] = useState(formatDate(values.start_date) || null);
  const [endDate, setEndDate] = useState(formatDate(values.end_date) || null);
  
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>(() => {
    // Initialize with default date range if both dates exist
    if (!startDate || !endDate) return {};
    
    const range: {[key: string]: any} = {};
    let currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      const dateString = currentDate.toISOString().split('T')[0];
      range[dateString] = {
        color: '#3b82f6',
        textColor: 'white',
        startingDay: dateString === startDate,
        endingDay: dateString === endDate,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return range;
  });

  const handleDayPress = (day: any) => {
    if (!startDate || (startDate && endDate)) {
      // First click or reset
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: '#3b82f6',
          textColor: 'white'
        }
      });
    } else {
      // Second click
      let newStartDate = startDate;
      let newEndDate = day.dateString;
      
      if (day.dateString < startDate) {
        // If selected end date is before start date, swap them
        newStartDate = day.dateString;
        newEndDate = startDate;
      }
      
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      
      const range: {[key: string]: any} = {};
      let currentDate = new Date(newStartDate);
      const endDateObj = new Date(newEndDate);

      while (currentDate <= endDateObj) {
        const dateString = currentDate.toISOString().split('T')[0];
        range[dateString] = {
          color: '#3b82f6',
          textColor: 'white',
          startingDay: dateString === newStartDate,
          endingDay: dateString === newEndDate
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setMarkedDates(range);
    }
  };

  useEffect(() => {
    // Convert YYYY-MM-DD to MM/DD/YYYY format when setting field values
    if (startDate) {
      const formattedDate = formatDisplayDate(startDate);
      if (formattedDate) {
        setFieldValue('start_date', formattedDate);
      }
    }
    if (endDate) {
      const formattedDate = formatDisplayDate(endDate);
      if (formattedDate) {
        setFieldValue('end_date', formattedDate);
      }
    }
  }, [startDate, endDate, setFieldValue]);

  const changeRefillValue = (type: 'plus' | 'minus') => {
    const currentRefills = Number(values.prescription_refills) || 0;
    
    if (type === 'plus') {
      setFieldValue('prescription_refills', currentRefills + 1);
    } else if (type === 'minus') {
      if (currentRefills > 0) {
        setFieldValue('prescription_refills', currentRefills - 1);
      }
    }
  };

  return (
    <View style={styles.formContainer}>
      {/* Treatment Period Calendar */}
      <View style={styles.inputGroup}>
        <Text style={[styles.sectionTitle, { color: themeColor.text }]}>
          Select the length of your medication course:
        </Text>
        <Calendar
          markingType={'period'}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          minDate={new Date().toISOString().split('T')[0]}
          theme={{
            backgroundColor: themeColor.background,
            calendarBackground: themeColor.background,
            textSectionTitleColor: themeColor.text,
            selectedDayBackgroundColor: '#3b82f6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3b82f6',
            dayTextColor: themeColor.text,
            textDisabledColor: '#9ca3af',
            arrowColor: '#3b82f6',
            monthTextColor: themeColor.text,
            indicatorColor: '#3b82f6',
          }}
        />
        {touched.start_date && errors.start_date && (
          <Text style={styles.errorText}>{errors.start_date}</Text>
        )}
        {touched.end_date && errors.end_date && (
          <Text style={styles.errorText}>{errors.end_date}</Text>
        )}
      </View>

      {/* Special Instructions */}
      <View style={styles.inputGroup}>
        <Text style={[styles.sectionTitle, { color: themeColor.text }]}>
          Special Instructions (Optional)
        </Text>
        <TextInput
          style={[styles.textArea, { 
            backgroundColor: themeColor.card, 
            color: themeColor.text, 
            borderColor: themeColor.border 
          }]}
          placeholder="Eg. Take with warm water"
          placeholderTextColor="#9ca3af"
          value={values.special_instructions}
          onChangeText={(text) => setFieldValue('special_instructions', text)}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Refills */}
      <View style={styles.inputGroup}>
        <Text style={[styles.sectionTitle, { color: themeColor.text }]}>
          Refills
        </Text>
        <View style={styles.refillsContainer}>
          <TouchableOpacity 
            style={[styles.refillButton, { backgroundColor: themeColor.card }]}
            onPress={() => changeRefillValue('minus')}
          >
            <AntDesign name="minus" size={20} color="#3b82f6" />
          </TouchableOpacity>
          
          <Text style={[styles.refillsText, { color: themeColor.text }]}>
            {values.prescription_refills || 0}
          </Text>
          
          <TouchableOpacity 
            style={[styles.refillButton, { backgroundColor: themeColor.card }]}
            onPress={() => changeRefillValue('plus')}
          >
            <AntDesign name="plus" size={20} color="#3b82f6" />
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  refillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  refillButton: {
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  refillsText: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  // Legacy styles (not used in new implementation)
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  calendarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  calendarCard: {
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    maxWidth: 350,
    width: '90%',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});