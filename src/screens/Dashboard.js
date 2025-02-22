import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Dashboard() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Navbar (Header) */}
      {/* <View style={styles.navbar}> */}
        {/* <Button title="☰ Menu" onPress={() => navigation.openDrawer()} /> */}
       
      {/* </View> */}

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.text}>Welcome to your Dashboard!</Text>
        <Button title="Logout" onPress={() => navigation.navigate('StartScreen')} />
      </View>
    </View>
  );
}

// ✅ Styles for Layout
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 15,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 10 },
});

