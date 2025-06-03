import AsyncStorage from '@react-native-async-storage/async-storage';

const PATIENTS_KEY = '@clinica_odontologica:pacientes_v2';

// Buscar todos os pacientes
export const getPatients = async () => {
  try {
    const data = await AsyncStorage.getItem(PATIENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao carregar:', e);
    return [];
  }
};

// Salvar novo paciente
export const savePatient = async (newPatient) => {
  try {
    const currentPatients = await getPatients();
    const updatedPatients = [...currentPatients, newPatient];
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(updatedPatients));
    return true;
  } catch (e) {
    console.error('Erro ao salvar:', e);
    return false;
  }
};

// Buscar paciente por CPF
export const getPatientByCpf = async (cpf) => {
  try {
    const patients = await getPatients();
    return patients.find(patient => patient.cpf === cpf.replace(/\D/g, ''));
  } catch (e) {
    console.error('Erro ao buscar paciente:', e);
    return null;
  }
};

// Atualizar paciente existente
export const updatePatient = async (cpfOriginal, updatedPatient) => {
  try {
    const patients = await getPatients();
    const index = patients.findIndex(patient => patient.cpf === cpfOriginal);
    
    if (index !== -1) {
      patients[index] = { ...updatedPatient, dataUltimaEdicao: new Date().toISOString() };
      await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
      console.log('✅ Paciente atualizado no storage:', patients[index]);
      return true;
    }
    console.log('❌ Paciente não encontrado para atualizar');
    return false;
  } catch (e) {
    console.error('Erro ao atualizar:', e);
    return false;
  }
};

// Excluir paciente
export const deletePatient = async (cpf) => {
  try {
    const patients = await getPatients();
    const filteredPatients = patients.filter(patient => patient.cpf !== cpf);
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(filteredPatients));
    console.log('✅ Paciente excluído do storage');
    return true;
  } catch (e) {
    console.error('Erro ao excluir:', e);
    return false;
  }
};


export const searchPatients = async (searchTerm) => {
  try {
    const patients = await getPatients();
    
    // Se não há termo de busca, retorna todos os pacientes
    if (!searchTerm || searchTerm.trim() === '') {
      console.log('📋 Retornando todos os pacientes:', patients.length);
      return patients;
    }
    
    // Normaliza o termo de busca
    const term = searchTerm.toLowerCase().trim();
    const termNumbers = searchTerm.replace(/\D/g, ''); // Remove tudo que não é número
    
    console.log('🔍 Buscando por:', `"${term}"`, '| CPF números:', `"${termNumbers}"`);
    console.log('📊 Total de pacientes para buscar:', patients.length);
    
    const resultados = patients.filter(patient => {
      // Verifica se os campos existem e normaliza antes de comparar
      const nome = (patient.nome || '').toLowerCase().trim();
      const cpf = (patient.cpf || '').replace(/\D/g, '');
      
      // Busca por nome (parcial, case insensitive)
      const nomeMatch = nome.includes(term);
      
      // Busca por CPF (parcial, só números)  
      const cpfMatch = termNumbers && cpf.includes(termNumbers);
      
      // Log para debug (remova depois se quiser)
      if (nomeMatch || cpfMatch) {
        console.log(`✅ Encontrado: ${patient.nome} - nome: ${nomeMatch}, cpf: ${cpfMatch}`);
      }
      
      return nomeMatch || cpfMatch;
    });
    
    console.log('🎯 Resultados encontrados:', resultados.length);
    return resultados;
    
  } catch (e) {
    console.error('❌ Erro na pesquisa:', e);
    return [];
  }
};