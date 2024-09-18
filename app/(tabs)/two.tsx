import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, Text, View, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface HighScore {
  name: string;
  score: number;
}

export default function HighScoresScreen() {
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  const loadHighScores = useCallback(async () => {
    try {
      const scores = JSON.parse(await AsyncStorage.getItem('highScores') || '[]');
      setHighScores(scores);
    } catch (error) {
      console.error('Error loading high scores:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHighScores();
    }, [loadHighScores])
  );

  const renderItem = ({ item, index }: { item: HighScore; index: number }) => (
    <View style={styles.scoreItem}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.score}>{item.score}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>High Scores</Text>
      <View style={styles.headerRow}>
        <Text style={styles.headerRank}>Rank</Text>
        <Text style={styles.headerName}>Name</Text>
        <Text style={styles.headerScore}>Score</Text>
      </View>
      <FlatList
        data={highScores}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 40, // Add some top padding
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    paddingHorizontal: 20, // Add horizontal padding
  },
  headerRank: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 50,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  headerScore: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'right',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20, // Add horizontal padding to list content
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 50,
  },
  name: {
    fontSize: 18,
    flex: 1,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'right',
  },
});
