import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Modal, TextInput, SafeAreaView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 3;
const CELL_SIZE = width * 0.25;
const CELL_MARGIN = 10;

const BLUE = '#4682B4';  // Steel Blue
const LIGHT_BLUE = '#6495ED';  // Cornflower Blue;

const SequenceMemoryGame = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'showing' | 'input' | 'gameover'>('showing');
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const navigation = useNavigation();

  const cellAnimations = Array(GRID_SIZE * GRID_SIZE).fill(0).map(() => useSharedValue(1));

  useEffect(() => {
    if (gameState === 'showing') {
      showSequence();
    }
  }, [gameState, sequence]);

  const showSequence = async () => {
    for (const cellIndex of sequence) {
      await new Promise(resolve => setTimeout(resolve, 500));
      cellAnimations[cellIndex].value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 300 })
      );
    }
    setGameState('input');
  };

  const handleCellPress = (index: number) => {
    if (gameState !== 'input') return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      handleGameOver();
    } else if (newUserSequence.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      setUserSequence([]);
      setSequence([...sequence, Math.floor(Math.random() * GRID_SIZE * GRID_SIZE)]);
      setGameState('showing');
    }
  };

  const handleGameOver = () => {
    setGameState('gameover');
    setShowModal(true);
  };

  const saveScore = async () => {
    try {
      const highScores = JSON.parse(await AsyncStorage.getItem('highScores') || '[]');
      highScores.push({ name: playerName, score });
      highScores.sort((a, b) => b.score - a.score);
      await AsyncStorage.setItem('highScores', JSON.stringify(highScores.slice(0, 10)));
      setShowModal(false);
      setPlayerName(''); // Reset player name
      resetGame(); // Reset the game after saving the score
      navigation.navigate('two');
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const resetGame = () => {
    setSequence([Math.floor(Math.random() * GRID_SIZE * GRID_SIZE)]);
    setUserSequence([]);
    setGameState('showing');
    setScore(0);
    setPlayerName(''); // Reset player name
    setShowModal(false); // Close the modal
  };

  const renderCell = (index: number) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cellAnimations[index].value }],
      backgroundColor: cellAnimations[index].value > 1 ? LIGHT_BLUE : BLUE,
    }));

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleCellPress(index)}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.cell, animatedStyle]} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sequence Game</Text>
      <Text style={styles.score}>Score: {score}</Text>
      <View style={styles.grid}>
        {Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, index) => renderCell(index))}
      </View>
      {gameState === 'gameover' && (
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Play Again</Text>
        </TouchableOpacity>
      )}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Over!</Text>
            <Text style={styles.modalScore}>Your Score: {score}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={playerName}
              onChangeText={setPlayerName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveScore}>
              <Text style={styles.saveButtonText}>Save Score</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
              <Text style={styles.resetButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingTop: 40, // Add some top padding
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: BLUE, // Use the same blue as the cells for consistency
  },
  score: {
    fontSize: 24,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: (CELL_SIZE + CELL_MARGIN * 2) * GRID_SIZE,
    height: (CELL_SIZE + CELL_MARGIN * 2) * GRID_SIZE,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: BLUE,
    margin: CELL_MARGIN,
    borderRadius: 8,
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: BLUE,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalScore: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: 200,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: BLUE,
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SequenceMemoryGame;

