import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NAV_THEME } from '../../constants';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your medication assistant. I can help you with questions about your medications, dosages, side effects, and general health advice. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('aspirin') || input.includes('pain')) {
      return "Aspirin is commonly used for pain relief and reducing inflammation. The typical dose for adults is 325-650mg every 4 hours as needed. Always take with food to reduce stomach irritation. Consult your doctor if you have any bleeding disorders or are taking blood thinners.";
    }
    
    if (input.includes('side effect') || input.includes('reaction')) {
      return "If you're experiencing side effects from a medication, it's important to note what you're feeling and when it started. Common side effects can include nausea, dizziness, or drowsiness. Contact your healthcare provider if side effects are severe or persistent. Never stop taking prescribed medications without consulting your doctor first.";
    }
    
    if (input.includes('dosage') || input.includes('dose')) {
      return "Medication dosages are very specific and depend on factors like your age, weight, medical condition, and other medications you're taking. I recommend checking with your pharmacist or doctor for dosage questions. Always follow the instructions on your prescription label or medication packaging.";
    }
    
    if (input.includes('interaction') || input.includes('drug')) {
      return "Drug interactions can be serious. Some medications can affect how others work or increase side effects. Always inform your healthcare providers about all medications, supplements, and vitamins you're taking. Your pharmacist can also check for interactions when filling prescriptions.";
    }
    
    if (input.includes('hello') || input.includes('hi')) {
      return "Hello! I'm here to help with your medication questions. Feel free to ask about dosages, side effects, interactions, or general medication guidance.";
    }
    
    return "I understand you're asking about medication-related topics. While I can provide general information, it's always best to consult with your healthcare provider or pharmacist for personalized medical advice. They can give you guidance specific to your situation and medical history. Is there a specific aspect of your medication that you'd like general information about?";
  };

  const quickQuestions = [
    "What are common side effects?",
    "How to take with food?",
    "When to take medication?",
    "What if I miss a dose?",
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat with AI Assistant</Text>
        <Text style={styles.headerSubtitle}>
          Get help with medication questions
        </Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text style={[
              styles.messageText,
              message.isUser ? styles.userMessageText : styles.aiMessageText,
            ]}>
              {message.text}
            </Text>
            <Text style={[
              styles.timestamp,
              message.isUser ? styles.userTimestamp : styles.aiTimestamp,
            ]}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        ))}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <Text style={styles.typingIndicator}>AI is typing...</Text>
          </View>
        )}
      </ScrollView>

      {messages.length === 1 && (
        <View style={styles.quickQuestionsContainer}>
          <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
          {quickQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickQuestionButton}
              onPress={() => setInputText(question)}
            >
              <Text style={styles.quickQuestionText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about medications, dosages, side effects..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={inputText.trim() ? '#fff' : '#9ca3af'} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAV_THEME.dark.background,
  },
  header: {
    backgroundColor: NAV_THEME.dark.card,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: NAV_THEME.dark.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: NAV_THEME.dark.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: NAV_THEME.dark.text,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: NAV_THEME.dark.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: NAV_THEME.dark.card,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: NAV_THEME.dark.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: NAV_THEME.dark.text,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#bfdbfe',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#9ca3af',
  },
  typingIndicator: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    padding: 16,
    backgroundColor: NAV_THEME.dark.card,
    borderTopWidth: 1,
    borderTopColor: NAV_THEME.dark.border,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: NAV_THEME.dark.text,
    marginBottom: 12,
  },
  quickQuestionButton: {
    backgroundColor: NAV_THEME.dark.background,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: NAV_THEME.dark.border,
  },
  quickQuestionText: {
    fontSize: 14,
    color: NAV_THEME.dark.text,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: NAV_THEME.dark.card,
    borderTopWidth: 1,
    borderTopColor: NAV_THEME.dark.border,
    alignItems: 'center',

  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: NAV_THEME.dark.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: NAV_THEME.dark.background,
    color: NAV_THEME.dark.text,
  },
  sendButton: {
    backgroundColor: NAV_THEME.dark.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: NAV_THEME.dark.border,
  },
});