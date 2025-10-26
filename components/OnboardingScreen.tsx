import { handleGoogleSignIn } from "@/utils/onboardingUtils";
import {
    GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: any;
  backgroundColor: string;
  isLoginSlide?: boolean;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: "Welcome to",
    subtitle: "KnowMyMeds",
    description: "Your personal medication companion that helps you stay on track with your health journey.",
    image: require('../assets/images/brand.png'),
    backgroundColor: "#E3F2FD",
  },
  {
    id: 2,
    title: "Smart",
    subtitle: "Medication Tracking",
    description: "Never miss a dose again with intelligent reminders and easy-to-use tracking features.",
    image: require('../assets/images/brand.png'),
    backgroundColor: "#F3E5F5",
  },
  {
    id: 3,
    title: "Stay",
    subtitle: "Healthy & Safe",
    description: "Get important information about your medications and potential interactions to keep you safe.",
    image: require('../assets/images/brand.png'),
    backgroundColor: "#E8F5E8",
  },
  {
    id: 4,
    title: "Ready to",
    subtitle: "Get Started?",
    description: "Sign in with your Google account to start managing your medications safely and effectively.",
    image: require('../assets/images/brand.png'),
    backgroundColor: "#FFF8E1",
    isLoginSlide: true,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);



  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const renderSlide = (slide: OnboardingSlide) => (
    <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={slide.image} style={styles.image} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
          <Text style={styles.description}>{slide.description}</Text>
          
          {/* Show Google Sign-In button only on the login slide */}
          {slide.isLoginSlide && (
            <View style={styles.loginContainer}>
              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleSignIn}
                style={styles.googleButton}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            currentIndex === index && styles.paginationDotActive,
          ]}
          onPress={() => goToSlide(index)}
        />
      ))}
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {slides.map(renderSlide)}
        
      </ScrollView>
      
      <View style={styles.footer}>
        {renderPagination()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 350,
  },
  imageContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#2563eb',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonSpacer: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 100,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  loginContainer: {
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
  },
  googleButton: {
    width: 240,
    height: 48,
  },
});