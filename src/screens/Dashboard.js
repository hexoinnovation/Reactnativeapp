import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Dashboard() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
       
       
      </View>
    </View>
  );
}

// ✅ Styles for Layout
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 10 },
});