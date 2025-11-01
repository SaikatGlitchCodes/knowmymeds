import React from 'react';
import { View, ScrollView } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useLocalSearchParams } from 'expo-router';
import { NAV_THEME } from '@/constants';

const SideEffect = () => {
    const { sideEffects } = useLocalSearchParams<{ sideEffects: string }>();
    return (
        <View className="flex-1 p-4 bg-background">
            <ScrollView showsVerticalScrollIndicator={false}>
                <RenderHtml 
                    contentWidth={300}
                    source={{ html: sideEffects }}
                    baseStyle={{ color: NAV_THEME.dark.text, fontSize: 16 }}
                />
            </ScrollView>
        </View>
    );
}

export default SideEffect;