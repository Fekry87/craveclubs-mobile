import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/common/Icon';
import { ProgressScreen, EvaluationsScreen } from '../screens/Progress';
import { ProgressStackParamList } from './types';
import { colors, fontFamily } from '../theme';

const Stack = createNativeStackNavigator<ProgressStackParamList>();

const BackButton: React.FC = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon name="arrow-left-s-line" size={28} color={colors.text} />
    </TouchableOpacity>
  );
};

export const ProgressNavigator: React.FC = () => {
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
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="ProgressMain"
        component={ProgressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Evaluations"
        component={EvaluationsScreen}
        options={{
          title: 'All Evaluations',
          headerBackVisible: false,
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack.Navigator>
  );
};
