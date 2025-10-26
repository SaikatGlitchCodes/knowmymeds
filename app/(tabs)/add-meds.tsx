import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AddMedsScreen() {
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [notes, setNotes] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const commonTimes = ['08:00', '12:00', '18:00', '22:00'];

  const toggleTimeSelection = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const handleSaveMedication = () => {
    if (!medicationName.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter the dosage');
      return;
    }
    if (!frequency.trim()) {
      Alert.alert('Error', 'Please enter the frequency');
      return;
    }

    // TODO: Save medication to database
    Alert.alert(
      'Success', 
      'Medication added successfully!',
      [{ text: 'OK', onPress: () => {
        // Clear form
        setMedicationName('');
        setDosage('');
        setFrequency('');
        setNotes('');
        setSelectedTimes([]);
      }}]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add New Medication</Text>
        <Text style={styles.headerSubtitle}>
          Fill in the details below to add a new medication to your schedule
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medication Name *</Text>
          <TextInput
            style={styles.input}
            value={medicationName}
            onChangeText={setMedicationName}
            placeholder="e.g., Aspirin, Vitamin D, etc."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosage *</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g., 100mg, 1 tablet, 2 capsules"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Frequency *</Text>
          <TextInput
            style={styles.input}
            value={frequency}
            onChangeText={setFrequency}
            placeholder="e.g., Once daily, Twice daily, As needed"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional instructions, side effects to monitor, etc."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.switchGroup}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.label}>Enable Reminders</Text>
            <Text style={styles.switchSubLabel}>
              Get notified when it&apos;s time to take your medication
            </Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
            trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
            thumbColor={remindersEnabled ? '#2563eb' : '#f3f4f6'}
          />
        </View>

        {remindersEnabled && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reminder Times</Text>
            <Text style={styles.subLabel}>Select when you want to be reminded</Text>
            <View style={styles.timeGrid}>
              {commonTimes.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    selectedTimes.includes(time) && styles.timeButtonSelected
                  ]}
                  onPress={() => toggleTimeSelection(time)}
                >
                  <Text style={[
                    styles.timeButtonText,
                    selectedTimes.includes(time) && styles.timeButtonTextSelected
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMedication}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Medication</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchSubLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timeButtonTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});