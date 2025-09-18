import {
  type ColorSchemeName,
  useColorScheme as useDeviceColorScheme,
} from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

export function useColorScheme(): ColorSchemeName {
  const preference = useSettingsStore((state) => state.theme);
  const deviceScheme = useDeviceColorScheme();

  if (preference === 'system') {
    return deviceScheme;
  }

  return preference;
}
