import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} variant="titleLarge">
        Clínica Odontológica Denise Menezes
             </Text>

      <Button
        mode="contained"
        icon="account-plus"
        onPress={() => navigation.navigate('Cadastro')}
        style={styles.button}
      >
        Cadastrar Novo Paciente
      </Button>

      <Button
        mode="outlined"
        icon="magnify"
        onPress={() => navigation.navigate('ListaPacientes')}
        style={styles.button}
      >
        Pesquisar Paciente
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
    fontSize: 22
  },
  button: {
    marginVertical: 10
  }
});
