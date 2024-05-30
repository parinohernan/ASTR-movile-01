import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

const ConsoleComponent = ({ logs }) => {
  return (
    <ScrollView style={styles.container}>
      {logs.map((log, index) => (
        <Text key={index} style={styles.log}>
          {log}
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c2f3c80',
    padding: 10,
    minHeight:200,
  },
  log: {
    color: "#c9eefa",
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 5,
  },
});

export default ConsoleComponent;
