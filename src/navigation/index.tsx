// ─────────────────────────────────────────────
//  Navigation — 4-tab bottom navigator
//  Tabs: Home · Events · Songs · Community
// ─────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, FontSize, FontWeight } from '../theme';

import HomeScreen    from '../screens/HomeScreen';
import EventsScreen  from '../screens/EventsScreen';
import SongsScreen   from '../screens/SongCatalogScreen';
import SocialScreen  from '../screens/SocialScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type TabConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const TABS: Record<string, TabConfig> = {
  Home:    { label: 'Home',      icon: 'home-outline',          iconFocused: 'home'          },
  Events:  { label: 'Events',    icon: 'calendar-outline',      iconFocused: 'calendar'      },
  Songs:   { label: 'Songs',     icon: 'musical-notes-outline', iconFocused: 'musical-notes' },
  Social:  { label: 'Community', icon: 'people-outline',        iconFocused: 'people'        },
};

function TabBarBackground() {
  return (
    <BlurView
      intensity={80}
      tint="dark"
      style={StyleSheet.absoluteFill}
    />
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config = TABS[route.name];
        return {
          headerShown: false,
          tabBarBackground: () => <TabBarBackground />,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            elevation: 0,
            height: 88,
            paddingBottom: 24,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons
                name={focused ? config.iconFocused : config.icon}
                size={focused ? 26 : 24}
                color={color}
              />
              {focused && (
                <View style={styles.activeDot} />
              )}
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{
              fontSize: FontSize.xs,
              color: focused ? Colors.primary : Colors.textMuted,
              fontWeight: focused ? FontWeight.semibold : FontWeight.regular,
              marginTop: 4,
            }}>
              {config.label}
            </Text>
          ),
        };
      }}
    >
      <Tab.Screen name="Home"   component={HomeScreen}   />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Songs"  component={SongsScreen}  />
      <Tab.Screen name="Social" component={SocialScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    position: 'absolute',
    bottom: -8,
  },
});
