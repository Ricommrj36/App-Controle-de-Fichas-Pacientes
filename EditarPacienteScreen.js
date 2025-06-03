import React, { useState } from 'react';
import { ScrollView, Alert, Platform, KeyboardAvoidingView, View } from 'react-native';
import { Button, TextInput, Snackbar, Dialog, Portal, Text } from 'react-native-paper';
import { TextInputMask } from 'react-native-masked-text';
import { updatePatient, deletePatient } from '../services/storage';

export default function EditarPacienteScreen({ navigation, route }) {
  const { paciente } = route.params;
  
  // Estados para todos os campos (inicializados com dados do paciente)
  const [nome, setNome] = useState(paciente.nome || '');
  const [cpf, setCpf] = useState(paciente.cpf || '');
  const [endereco, setEndereco] = useState(paciente.endereco || '');
  const [bairro, setBairro] = useState(paciente.bairro || '');
  const [cidade, setCidade] = useState(paciente.cidade || '');
  const [telefone, setTelefone] = useState(paciente.telefone || '');
  const [tratamento, setTratamento] = useState(paciente.tratamento || '');
  const [dataConsulta, setDataConsulta] = useState(paciente.dataConsulta || '');
  const [valor, setValor] = useState(paciente.valor ? `R$ ${paciente.valor.toFixed(2).replace('.', ',')}` : '');
  const [saldo, setSaldo] = useState(paciente.saldo ? `R$ ${paciente.saldo.toFixed(2).replace('.', ',')}` : '');
  const [historico, setHistorico] = useState(paciente.historico || '');
  
  // Estados para feedback e controle
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Formatar CPF para exibição
  const formatarCpfParaExibicao = (cpf) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Formatar telefone para exibição
  const formatarTelefoneParaExibicao = (telefone) => {
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const handleSalvar = async () => {
    // Validação dos campos obrigatórios
    if (!nome || !cpf || !telefone) {
      setMensagemErro('⚠️ Preencha Nome, CPF e Telefone!');
      setShowErrorSnackbar(true);
      return;
    }

    setSalvando(true);

    // Prepara os dados atualizados
    const pacienteAtualizado = { // 
      ...paciente, // Mantém dados originais como ID e data de cadastro
      nome: nome.trim(),
      cpf: cpf.replace(/\D/g, ''),
      endereco: endereco.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      telefone: telefone.replace(/\D/g, ''),
      tratamento: tratamento.trim(),
      dataConsulta,
      valor: valor ? parseFloat(valor.replace('R$ ', '').replace(',', '.')) : 0,
      saldo: saldo ? parseFloat(saldo.replace('R$ ', '').replace(',', '.')) : 0,
      historico: historico.trim()
    };

    console.log('🔄 Atualizando paciente:', pacienteAtualizado);
    console.log('🔑 CPF original:', paciente.cpf);

    try {
      const atualizou = await updatePatient(paciente.cpf, pacienteAtualizado);
      
      if (atualizou) {
        console.log('✅ Paciente atualizado com sucesso!');
        setMensagem(`✅ ${nome} atualizado com sucesso!`);
        setShowSnackbar(true);
        
        // Volta para a lista após 2 segundos
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
        
      } else {
        setMensagemErro('❌ Falha ao atualizar o paciente');
        setShowErrorSnackbar(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      setMensagemErro('⚠️ Ocorreu um problema inesperado');
      setShowErrorSnackbar(true);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    setExcluindo(true);
    
    try {
      console.log('🗑️ Excluindo paciente com CPF:', paciente.cpf);
      const excluiu = await deletePatient(paciente.cpf);
      
      if (excluiu) {
        console.log('✅ Paciente excluído com sucesso!');
        setShowDeleteDialog(false);
        setMensagem(`🗑️ ${nome} foi excluído`);
        setShowSnackbar(true);
        
        // Volta para a lista após 1.5 segundos
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
        
      } else {
        setMensagemErro('❌ Falha ao excluir o paciente');
        setShowErrorSnackbar(true);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setMensagemErro('⚠️ Ocorreu um problema inesperado');
      setShowErrorSnackbar(true);
    } finally {
      setExcluindo(false);
    }
  };

  const confirmarExclusao = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          <TextInput
            label="Nome Completo *"
            value={nome}
            onChangeText={setNome}
            style={{ marginBottom: 15 }}
            mode="outlined"
          />

          <TextInput
            label="CPF *"
            value={formatarCpfParaExibicao(cpf)}
            editable={false}
            style={{ marginBottom: 15 }}
            mode="outlined"
            right={<TextInput.Icon icon="lock" />}
          />

          <TextInput
            label="Telefone *"
            value={formatarTelefoneParaExibicao(telefone)}
            onChangeText={(text) => setTelefone(text.replace(/\D/g, ''))}
            style={{ marginBottom: 15 }}
            mode="outlined"
            keyboardType="phone-pad"
          />

          <TextInput
            label="Endereço"
            value={endereco}
            onChangeText={setEndereco}
            style={{ marginBottom: 15 }}
            mode="outlined"
          />

          <TextInput
            label="Bairro"
            value={bairro}
            onChangeText={setBairro}
            style={{ marginBottom: 15 }}
            mode="outlined"
          />

          <TextInput
            label="Cidade"
            value={cidade}
            onChangeText={setCidade}
            style={{ marginBottom: 15 }}
            mode="outlined"
          />

          <TextInput
            label="Tipo de Tratamento"
            value={tratamento}
            onChangeText={setTratamento}
            style={{ marginBottom: 15 }}
            mode="outlined"
          />

          <TextInputMask
            type={'datetime'}
            options={{ format: 'DD/MM/YYYY' }}
            value={dataConsulta}
            onChangeText={setDataConsulta}
            customTextInput={TextInput}
            customTextInputProps={{
              label: "Data da Consulta",
              mode: "outlined",
              style: { marginBottom: 15 }
            }}
          />

          <TextInputMask
            type={'money'}
            options={{
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: 'R$ ',
            }}
            value={valor}
            onChangeText={setValor}
            customTextInput={TextInput}
            customTextInputProps={{
              label: "Valor Pago",
              mode: "outlined",
              style: { marginBottom: 15 },
              keyboardType: 'numeric'
            }}
          />

          <TextInputMask
            type={'money'}
            options={{
              precision: 2,
              separator: ',',
              delimiter: '.',
              unit: 'R$ ',
            }}
            value={saldo}
            onChangeText={setSaldo}
            customTextInput={TextInput}
            customTextInputProps={{
              label: "Saldo",
              mode: "outlined",
              style: { marginBottom: 15 },
              keyboardType: 'numeric'
            }}
          />

          <TextInput
            label="Histórico do Paciente"
            value={historico}
            onChangeText={setHistorico}
            style={{ marginBottom: 25 }}
            mode="outlined"
            multiline
            numberOfLines={4}
          />

          <View style={{ gap: 10 }}>
            <Button
              mode="contained"
              onPress={handleSalvar}
              loading={salvando}
              disabled={salvando || excluindo}
              style={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16 }}
              icon="content-save"
            >
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </Button>

            <Button
              mode="outlined"
              onPress={confirmarExclusao}
              disabled={salvando || excluindo}
              style={{ paddingVertical: 8 }}
              labelStyle={{ fontSize: 16 }}
              buttonColor="#ffebee"
              textColor="#d32f2f"
              icon="delete"
            >
              Excluir Paciente
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>⚠️ Confirmar Exclusão</Dialog.Title>
          <Dialog.Content>
            
            <Text variant="bodyMedium">
              Tem certeza que deseja excluir o paciente {nome}?
              {'\n\n'}Esta ação não pode ser desfeita.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button 
              onPress={handleExcluir} 
              loading={excluindo}
              textColor="#d32f2f"
            >
              {excluindo ? 'Excluindo...' : 'Excluir'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar de sucesso */}
      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
      >
        {mensagem}
      </Snackbar>

      
      <Snackbar
        visible={showErrorSnackbar}
        onDismiss={() => setShowErrorSnackbar(false)}
        duration={4000}
        style={{ backgroundColor: '#d32f2f' }}
        action={{
          label: 'OK',
          onPress: () => setShowErrorSnackbar(false),
          labelStyle: { color: 'white' }
        }}
      >
        {mensagemErro}
      </Snackbar>
    </>
  );
}