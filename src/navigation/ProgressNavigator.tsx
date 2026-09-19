import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { DirectionalIcon } from '../components/common/DirectionalIcon';
import { ProgressAndMeasurementsScreen, EvaluationsScreen } from '../screens/Progress';
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
      <DirectionalIcon name="arrow-left-s-line" size={28} color={colors.text} />
    </TouchableOpacity>
  );
};

export const ProgressNavigator: React.FC = () => {
  const { t } = useTranslation('nav');
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontFamily: fontFamily.headingBold,
          color: colors.text,
          fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="ProgressMain"
        component={ProgressAndMeasurementsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Evaluations"
        component={EvaluationsScreen}
        options={{
          title: t('titles.allEvaluations'),
          headerBackVisible: false,
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack.Navigator>
  );
};
