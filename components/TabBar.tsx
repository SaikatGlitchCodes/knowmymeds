import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { NAV_THEME } from '../constants';
import { router } from 'expo-router';

const tabStyle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingBottom: 30,
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const colorScheme = useColorScheme();
  const btnColor = NAV_THEME[colorScheme === "light" ? "light" : "dark"].btn;
  
  const getIcon = (routeName: string, color: string, size: number = 30): React.ReactNode => {
    const iconProps = { color, size };
    
    switch (routeName) {
      case 'home':
        return <AntDesign name="home" {...iconProps} />;
      case 'chat':
        return <Ionicons name="chatbox-outline" {...iconProps}/>;
      case 'add-meds':
        return <AntDesign name="plus" {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={[tabStyle.container, { backgroundColor: NAV_THEME[colorScheme === "light" ? "light" : "dark"].background }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? typeof options.tabBarLabel === 'string' 
              ? options.tabBarLabel 
              : options.title !== undefined
                ? options.title
                : route.name
            : options.title !== undefined
              ? options.title
              : route.name;

        if (['_sitemap', '+not-found'].includes(route.name)) {
          return null;
        }

        const isFocused = state.index === index;

        const onPress = (): void => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = (): void => {
          router.push('/addMedsForm');
        };

        // Make add-meds tab special button style
        if (route.name === 'add-meds') {
          return (
            <TouchableOpacity
              key={route.name}
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[tabStyle.btn, { backgroundColor: btnColor }]}
            >
              {getIcon(route.name, 'white', 25)}
              <Text style={{ color: 'white', fontSize: 16 }}>
                {typeof label === 'string' ? label : 'Add Meds'}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            style={tabStyle.tab}
            onLongPress={() => Alert.alert("Developing this eater egg!")}
          >
            {getIcon(route.name, isFocused ? btnColor : NAV_THEME[colorScheme === "light" ? "light" : "dark"].text)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default TabBar;