import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Button, TextInput, Card, Text, Chip, Searchbar } from 'react-native-paper';
import { getPatients, searchPatients } from '../services/storage';

export default function ListaPacientesScreen({ navigation }) {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [carregando, setCarregando] = useState(false);

  const carregarPacientes = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await getPatients();
      setPacientes(lista);
      
      // Se há uma busca ativa, reaplica o filtro
      if (searchQuery.trim() !== '') {
        const resultados = await searchPatients(searchQuery);
        setPacientesFiltrados(resultados);
      } else {
        setPacientesFiltrados(lista);
      }
      
      console.log('📋 Pacientes carregados:', lista.length);
    } catch (error) {
      console.error('❌ Erro ao carregar pacientes:', error);
      setPacientes([]);
      setPacientesFiltrados([]);
    }
    setCarregando(false);
  }, [searchQuery]);

  const pesquisarPacientes = async (query) => {
    console.log('🔍 Iniciando pesquisa por:', `"${query}"`);
    setSearchQuery(query);
    
    if (query.trim() === '') {
      console.log('📋 Busca vazia - mostrando todos os pacientes');
      setPacientesFiltrados(pacientes);
    } else {
      setCarregando(true);
      try {
        console.log('📊 Pacientes disponíveis para busca:', pacientes.length);
        const resultados = await searchPatients(query);
        console.log('🎯 Resultados da pesquisa:', resultados.length);
        setPacientesFiltrados(resultados);
      } catch (error) {
        console.error('❌ Erro na pesquisa:', error);
        setPacientesFiltrados([]);
      }
      setCarregando(false);
    }
  };

  const formatarCpf = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarPacientes);
    return unsubscribe;
  }, [navigation, carregarPacientes]);

  const renderPaciente = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EditarPaciente', { paciente: item })}
      style={{ marginBottom: 10 }}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            
            <Text variant="titleMedium" style={styles.nome}>
              {(item.nome || '').toUpperCase()}
            </Text>
            <Chip mode="outlined" compact>
              {formatarCpf(item.cpf)}
            </Chip>
          </View>
          
          <View style={styles.info}>
            <Text variant="bodyMedium" style={styles.telefone}>
              📱 {formatarTelefone(item.telefone)}
            </Text>
            
            {item.tratamento && (
              <Text variant="bodySmall" style={styles.tratamento}>
              
                🦷 {item.tratamento.toUpperCase()}
              </Text>
            )}
            
            <View style={styles.valores}>
              <Text variant="bodySmall">
                💰 VALOR: {formatarMoeda(item.valor)}
              </Text>
              <Text variant="bodySmall" style={styles.saldo}>
                💳 SALDO: {formatarMoeda(item.saldo)}
              </Text>
            </View>
            
            {item.dataConsulta && (
              <Text variant="bodySmall" style={styles.data}>
                📅 CONSULTA: {item.dataConsulta}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Cadastro')}
        style={styles.botaoNovo}
        icon="plus"
      >
        NOVO PACIENTE
      </Button>

      <Searchbar
        placeholder="PESQUISAR POR NOME OU CPF..."
        onChangeText={pesquisarPacientes}
        value={searchQuery}
        style={styles.searchbar}
        loading={carregando}
       
        onSubmitEditing={() => pesquisarPacientes(searchQuery)}
      />

      <View style={styles.contador}>
        <Text variant="bodyMedium">
          {pacientesFiltrados.length} PACIENTE(S) ENCONTRADO(S)
        </Text>
      </View>

      <FlatList
        data={pacientesFiltrados}
        keyExtractor={(item, index) => `${item.cpf || index}-${index}`}
        renderItem={renderPaciente}
        refreshing={carregando}
        onRefresh={carregarPacientes}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text variant="bodyLarge">
              {searchQuery ? 'NENHUM PACIENTE ENCONTRADO' : 'NENHUM PACIENTE CADASTRADO'}
            </Text>
            <Text variant="bodyMedium" style={styles.vazioSubtitle}>
              {searchQuery ? 'TENTE UMA PESQUISA DIFERENTE' : 'CADASTRE O PRIMEIRO PACIENTE'}
            </Text>
          </View>
        }
        
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5'
  },
  botaoNovo: {
    marginBottom: 15
  },
  searchbar: {
    marginBottom: 10
  },
  contador: {
    paddingHorizontal: 5,
    paddingVertical: 8,
    alignItems: 'center'
  },
  card: {
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  nome: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 10
  },
  info: {
    gap: 5
  },
  telefone: {
    color: '#666'
  },
  tratamento: {
    color: '#0066cc',
    fontStyle: 'italic'
  },
  valores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5
  },
  saldo: {
    fontWeight: 'bold',
    color: '#008000'
  },
  data: {
    color: '#666',
    marginTop: 3
  },
  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  vazioSubtitle: {
    marginTop: 5,
    color: '#666'
  }
});