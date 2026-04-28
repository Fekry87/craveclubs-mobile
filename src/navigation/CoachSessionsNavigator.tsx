import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import {
  CoachSessionsScreen,
  CoachSessionDetailScreen,
  CoachSessionLiveScreen,
  CoachCreateSessionScreen,
  CoachSessionAttendanceScreen,
} from '../screens/Coach';
import { Icon } from '../components/common/Icon';
import { CoachSessionsStackParamList } from './types';
import { colors, fontFamily } from '../theme';

const Stack = createNativeStackNavigator<CoachSessionsStackParamList>();

const BackButton: React.FC = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      activeOpacity={0.7}
      style={backStyles.btn}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon name="arrow-left-s-line" size={28} color={colors.text} />
    </TouchableOpacity>
  );
};

const backStyles = StyleSheet.create({
  btn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const CoachSessionsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontFamily: fontFamily.headingBold,
          color: colors.text,
          fontSize: 20,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="CoachSessionsList"
        component={CoachSessionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CoachSessionDetail"
        component={CoachSessionDetailScreen}
        options={{
          title: 'Session Details',
          headerBackVisible: false,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="CoachSessionLive"
        component={CoachSessionLiveScreen}
        options={{
          title: 'Live Session',
          headerBackVisible: false,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="CoachCreateSession"
        component={CoachCreateSessionScreen}
        options={{
          title: 'New Session',
          headerBackVisible: false,
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="CoachSessionAttendance"
        component={CoachSessionAttendanceScreen}
        options={{
          title: 'Attendance',
          headerBackVisible: false,
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack.Navigator>
  );
};
