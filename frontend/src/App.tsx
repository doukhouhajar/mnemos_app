/**
 * Main App Component with Enhanced Navigation
 */

import React, { useState } from 'react';
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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTypeSelect = async (type: ExperienceType) => {
    try {
      // Generate experience with the specific type
      const experiences = await api.generateExperiences(memoryObject.id, 1, type);
      let experience: ExperienceInstance;
      
      if (experiences.length > 0) {
        experience = { ...experiences[0], template_type: type };
      } else {
        // Fallback: generate prompt based on type
        const prompts: Record<ExperienceType, string> = {
          free_recall: `Recall ${memoryObject.title} from memory. Write down everything you remember about it without looking at any notes.`,
          cued_recall: `What is ${memoryObject.title}? Use the following hint: ${memoryObject.intuition}`,
          application: `Apply your knowledge of ${memoryObject.title}. ${memoryObject.examples.length > 0 ? `Example: ${memoryObject.examples[0]}` : 'Think of a practical application.'}`,
          explain_simply: `Explain ${memoryObject.title} as if you're teaching it to someone who has never heard of it. Keep it simple and clear.`,
          misconception_detection: `Identify common misconceptions about ${memoryObject.title}. What mistakes do people often make when learning this?`,
          micro_teach: `Teach ${memoryObject.title} in your own words. Include the definition, key intuition, and an example.`,
        };
        
        experience = {
          id: `exp-${Date.now()}`,
          memory_object_id: memoryObject.id,
          template_type: type,
          prompt: prompts[type] || prompts.free_recall,
          metadata: {},
        };
      }

      navigation.navigate('MemoryExperience', {
        memoryObject,
        experience,
      });
    } catch (error) {
      console.error('Error generating experiences:', error);
      // Fallback with type-specific prompt
      const prompts: Record<ExperienceType, string> = {
        free_recall: `Recall ${memoryObject.title} from memory. Write down everything you remember.`,
        cued_recall: `What is ${memoryObject.title}? Hint: ${memoryObject.intuition}`,
        application: `Apply ${memoryObject.title} to solve a problem.`,
        explain_simply: `Explain ${memoryObject.title} simply.`,
        misconception_detection: `What are common misconceptions about ${memoryObject.title}?`,
        micro_teach: `Teach ${memoryObject.title} in your own words.`,
      };
      
      const experience: ExperienceInstance = {
        id: `exp-${Date.now()}`,
        memory_object_id: memoryObject.id,
        template_type: type,
        prompt: prompts[type] || prompts.free_recall,
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
      onBack={handleBack}
    />
  );
}

// Experience screen component
function ExperienceScreen({ route, navigation }: any) {
  const { memoryObject, experience } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = () => {
    // Navigate back to calendar and refresh
    navigation.navigate('MainTabs', {
      screen: 'Calendar',
      params: { refresh: Date.now() },
    });
  };

  return (
    <MemoryExperience
      memoryObject={memoryObject}
      experience={experience}
      userId={CURRENT_USER_ID}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}

// Calendar screen component with navigation
function CalendarScreen({ navigation, route }: any) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh calendar when returning from review
  React.useEffect(() => {
    if (route.params?.refresh) {
      setRefreshKey(prev => prev + 1);
    }
  }, [route.params?.refresh]);

  const handleMemorySelect = (memory: MemoryObject) => {
    navigation.navigate('ExperienceType', { memoryObject: memory });
  };

  return (
    <CalendarView
      key={refreshKey}
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
