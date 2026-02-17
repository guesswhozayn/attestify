import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutGrid, Award, ShieldCheck, User, Activity } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

// Screens
import IssuerDashboardScreen from '../screens/IssuerDashboardScreen';
import StudentDashboardScreen from '../screens/StudentDashboardScreen';
import CredentialsScreen from '../screens/CredentialsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuditLogsScreen from '../screens/AuditLogsScreen';

const DashboardIcon = ({ color, size }: { color: string; size: number }) => (
  <LayoutGrid color={color} size={size} />
);
const CredentialsIcon = ({ color, size }: { color: string; size: number }) => (
  <Award color={color} size={size} />
);
const AuditIcon = ({ color, size }: { color: string; size: number }) => (
  <Activity color={color} size={size} />
);
const VerifyIcon = ({ color, size }: { color: string; size: number }) => (
  <ShieldCheck color={color} size={size} />
);
const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <User color={color} size={size} />
);

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
          tabBarIcon: DashboardIcon,
        }}
      />
      <Tab.Screen 
        name="Credentials" 
        component={CredentialsScreen} 
        options={{
          tabBarIcon: CredentialsIcon,
        }}
      />
      {isIssuer && (
        <Tab.Screen 
          name="Audit" 
          component={AuditLogsScreen} 
          options={{
            tabBarIcon: AuditIcon,
          }}
        />
      )}
      <Tab.Screen 
        name="Verify" 
        component={VerificationScreen} 
        options={{
          tabBarIcon: VerifyIcon,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
