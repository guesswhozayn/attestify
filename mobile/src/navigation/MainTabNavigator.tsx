import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutGrid, Award, ShieldCheck, User, Settings, Activity } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

// Screens
import IssuerDashboardScreen from '../screens/IssuerDashboardScreen';
import StudentDashboardScreen from '../screens/StudentDashboardScreen';
import CredentialsScreen from '../screens/CredentialsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuditLogsScreen from '../screens/AuditLogsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { user } = useAuth();
  const isIssuer = user?.role === 'ISSUER';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#030712',
          borderTopColor: 'rgba(55, 65, 81, 0.5)',
          paddingTop: 8,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textDim,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={isIssuer ? IssuerDashboardScreen : StudentDashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Credentials" 
        component={CredentialsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Award color={color} size={size} />,
        }}
      />
      {isIssuer && (
        <Tab.Screen 
          name="Audit" 
          component={AuditLogsScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
          }}
        />
      )}
      <Tab.Screen 
        name="Verify" 
        component={VerificationScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
