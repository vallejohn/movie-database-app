import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar, StyleSheet, useColorScheme, View, Text } from 'react-native';

function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
        <Text>Welcome</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;