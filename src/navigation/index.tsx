// ─────────────────────────────────────────────
//  Navigation — Bottom tab + stack navigator
// ─────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors, FontSize, FontWeight } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import NowPlayingScreen from '../screens/NowPlayingScreen';
import EventsScreen from '../screens/EventsScreen';
import SongCatalogScreen from '../screens/SongCatalogScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import SocialScreen from '../screens/SocialScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type TabIconConfig = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const TAB_ICONS: Record<string, TabIconConfig> = {
  Home:       { name: 'Home',       icon: 'home-outline',          iconFocused: 'home'          },
  NowPlaying: { name: 'Now',        icon: 'musical-notes-outline', iconFocused: 'musical-notes' },
  Events:     { name: 'Events',     icon: 'calendar-outline',      iconFocused: 'calendar'      },
  Songs:      { name: 'Songs',      icon: 'disc-outline',          iconFocused: 'disc'          },
  Reviews:    { name: 'Reviews',    icon: 'star-outline',          iconFocused: 'star'          },
  Social:     { name: 'Community',  icon: 'people-outline',        iconFocused: 'people'        },
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

function TabBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: FontWeight.medium,
          marginTop: -4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const config = TAB_ICONS[route.name];
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons
                name={focused ? config.iconFocused : config.icon}
                size={focused ? 26 : 24}
                color={color}
              />
              {focused && (
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.primary,
                  position: 'absolute',
                  bottom: -8,
                }} />
              )}
            </View>
          );
        },
        tabBarLabel: ({ focused, color }) => (
          <Text style={{
            fontSize: FontSize.xs,
            color: focused ? Colors.primary : Colors.textMuted,
            fontWeight: focused ? FontWeight.semibold : FontWeight.regular,
            marginTop: 4,
          }}>
            {TAB_ICONS[route.name].name}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="NowPlaying" component={NowPlayingScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Songs" component={SongCatalogScreen} />
      <Tab.Screen name="Reviews" component={ReviewsScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabBar} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
