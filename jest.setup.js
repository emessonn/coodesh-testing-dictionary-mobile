jest.mock('@react-native-async-storage/async-storage', () => {
  const mockStore = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async key => mockStore.get(key) ?? null),
      setItem: jest.fn(async (key, value) => {
        mockStore.set(key, String(value));
      }),
      removeItem: jest.fn(async key => {
        mockStore.delete(key);
      }),
      clear: jest.fn(async () => {
        mockStore.clear();
      }),
    },
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const SafeAreaInsetsContext = React.createContext(insets);
  const SafeAreaFrameContext = React.createContext({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
  });
  return {
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    SafeAreaProvider: ({ children }) =>
      React.createElement(
        SafeAreaInsetsContext.Provider,
        { value: insets },
        React.createElement(View, { testID: 'safe-area-provider' }, children),
      ),
    SafeAreaView: ({ children, style }) =>
      React.createElement(View, { style, testID: 'safe-area-view' }, children),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});
