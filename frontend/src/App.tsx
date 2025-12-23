/**
 * Main App Component with Enhanced Navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarView } from './components/CalendarView';
import { MemoryExperience } from './components/MemoryExperience';
import { MetacognitionDashboard } from './components/MetacognitionDashboard';
import { GroupsView } from './components/GroupsView';
import { WeeklyQuestsView } from './components/WeeklyQuestsView';
import { ExperienceTypeSelector } from './components/ExperienceTypeSelector';
import { MemoryObject } from '@shared/types/domain';
import { ExperienceInstance, ExperienceType } from '@shared/types/experience';
import { api } from './services/api';
import { Text } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder - replace with actual user ID from auth
const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000123';

// Experience Type Selection Screen
function ExperienceTypeScreen({ route, navigation }: any) {
  const { memoryObject } = route.params;

  const handleTypeSelect = async (type: ExperienceType) => {
    try {
      const experiences = await api.generateExperiences(memoryObject.id, 1);
      let experience: ExperienceInstance;
      
      if (experiences.length > 0) {
        experience = { ...experiences[0], template_type: type };
      } else {
        experience = {
          id: 'exp-1',
          memory_object_id: memoryObject.id,
          template_type: type,
          prompt: `Recall: ${memoryObject.title}\n\n${memoryObject.definition}`,
          metadata: {},
        };
      }

      navigation.navigate('MemoryExperience', {
        memoryObject,
        experience,
      });
    } catch (error) {
      console.error('Error generating experiences:', error);
      const experience: ExperienceInstance = {
        id: 'exp-1',
        memory_object_id: memoryObject.id,
        template_type: type,
        prompt: `Recall: ${memoryObject.title}\n\n${memoryObject.definition}`,
        metadata: {},
      };
      navigation.navigate('MemoryExperience', {
        memoryObject,
        experience,
      });
    }
  };

  return (
    <ExperienceTypeSelector
      selectedType={undefined}
      onSelect={handleTypeSelect}
    />
  );
}

// Experience screen component
function ExperienceScreen({ route, navigation }: any) {
  const { memoryObject, experience } = route.params;

  const handleComplete = () => {
    navigation.goBack();
  };

  return (
    <MemoryExperience
      memoryObject={memoryObject}
      experience={experience}
      userId={CURRENT_USER_ID}
      onComplete={handleComplete}
    />
  );
}

// Calendar screen component with navigation
function CalendarScreen({ navigation }: any) {
  const handleMemorySelect = (memory: MemoryObject) => {
    navigation.navigate('ExperienceType', { memoryObject: memory });
  };

  return (
    <CalendarView
      userId={CURRENT_USER_ID}
      onMemorySelect={handleMemorySelect}
    />
  );
}

// Screen components for tabs
function MetacognitionScreen() {
  return <MetacognitionDashboard userId={CURRENT_USER_ID} />;
}

function QuestsScreen() {
  return <WeeklyQuestsView userId={CURRENT_USER_ID} />;
}

function GroupsScreen() {
  return <GroupsView userId={CURRENT_USER_ID} />;
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 80 : 60,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: -0.2,
        },
      }}
    >
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, fontWeight: '600', color }}>C</Text>,
          tabBarLabel: 'Calendar',
        }}
      />
      <Tab.Screen
        name="Metacognition"
        component={MetacognitionScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, fontWeight: '600', color }}>I</Text>,
          tabBarLabel: 'Insights',
        }}
      />
      <Tab.Screen
        name="Quests"
        component={QuestsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, fontWeight: '600', color }}>Q</Text>,
          tabBarLabel: 'Quests',
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, fontWeight: '600', color }}>G</Text>,
          tabBarLabel: 'Groups',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
        />
        <Stack.Screen 
          name="ExperienceType" 
          component={ExperienceTypeScreen}
        />
        <Stack.Screen 
          name="MemoryExperience" 
          component={ExperienceScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
