import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';

const Card = ({ title, children, style }) => {
  return (
    <PaperCard style={[styles.card, style]}>
      <PaperCard.Content>
        {title && <Text style={styles.title}>{title}</Text>}
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', // Add shadow for web
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default Card;
