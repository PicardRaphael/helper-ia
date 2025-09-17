import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name='prompt'
        options={{
          title: 'Prompt',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='doc.text' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='historique'
        options={{
          title: 'Historique',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='clock' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='parametres'
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='gearshape.fill' color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
