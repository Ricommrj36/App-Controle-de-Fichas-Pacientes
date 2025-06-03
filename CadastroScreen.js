import React, { useState } from 'react';
import { ScrollView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import { TextInputMask } from 'react-native-masked-text';
import { savePatient, getPatients } from '../services/storage';

export default function CadastroScreen({ navigation }) {
  // Estados para todos os campos
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tratamento, setTratamento] = useState('');
  const [dataConsulta, setDataConsulta] = useState('');
  const [valor, setValor] = useState('');
  const [saldo, setSaldo] = useState('');
  const [historico, setHistorico] = useState('');
  
  // Estados para feedback
  const [salvando, setSalvando] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const limparFormulario = () => {
    setNome('');
    setCpf('');
    setEndereco('');
    setBairro('');
    setCidade('');
    setTelefone('');
    setTratamento('');
    setDataConsulta('');
    setValor('');
    setSaldo('');
    setHistorico('');
  };

  // Função para verificar duplicatas
  const verificarDuplicatas = async (nomeParaVerificar, cpfParaVerificar) => {
    try {
      const pacientesExistentes = await getPatients();
      
      // Remove espaços extras e converte para minúsculas para comparação
      const nomeNormalizado = nomeParaVerificar.trim().toLowerCase();
      const cpfLimpo = cpfParaVerificar.replace(/\D/g, '');
      
      // Verifica se já existe paciente com o mesmo nome
      const pacienteComMesmoNome = pacientesExistentes.find(paciente => 
        paciente.nome.trim().toLowerCase() === nomeNormalizado
      );
      
      // Verifica se já existe paciente com o mesmo CPF
      const pacienteComMesmoCpf = pacientesExistentes.find(paciente => 
        paciente.cpf === cpfLimpo
      );
      
      return {
        nomeExiste: !!pacienteComMesmoNome,
        cpfExiste: !!pacienteComMesmoCpf,
        pacienteNome: pacienteComMesmoNome,
        pacienteCpf: pacienteComMesmoCpf
      };
      
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      return { nomeExiste: false, cpfExiste: false };
    }
  };

  const handleSalvar = async () => {
    // Validação dos campos obrigatórios
    if (!nome || !cpf || !telefone) {
      setMensagemErro('⚠️ Preencha Nome, CPF e Telefone!');
      setShowErrorSnackbar(true);
      return;
    }

    // Validação de CPF (verificar se tem 11 dígitos)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setMensagemErro('⚠️ CPF deve ter 11 dígitos!');
      setShowErrorSnackbar(true);
      return;
    }

    setSalvando(true);

    try {
      // Verificar duplicatas ANTES de salvar
      console.log('🔍 Verificando duplicatas...');
      const { nomeExiste, cpfExiste, pacienteNome, pacienteCpf } = await verificarDuplicatas(nome, cpf);
      
      if (nomeExiste || cpfExiste) {
        setSalvando(false);
        
        let mensagemErroTexto = '';
        if (nomeExiste && cpfExiste) {
          mensagemErroTexto = `❌ Já existe um paciente cadastrado com o nome "${nome}" e CPF "${cpf}"`;
        } else if (nomeExiste) {
          mensagemErroTexto = `❌ Já existe um paciente cadastrado com o nome "${nome}"`;
        } else if (cpfExiste) {
          mensagemErroTexto = `❌ Já existe um paciente cadastrado com o CPF "${cpf}"`;
        }
        
        setMensagemErro(mensagemErroTexto);
        setShowErrorSnackbar(true);
        return;
      }

      // Se chegou até aqui, não há duplicatas - pode salvar
      console.log('✅ Nenhuma duplicata encontrada. Salvando paciente...');

      // Prepara os dados do paciente
      const paciente = {
        nome: nome.trim(),
        cpf: cpfLimpo,
        endereco: endereco.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        telefone: telefone.replace(/\D/g, ''),
        tratamento: tratamento.trim(),
        dataConsulta,
        valor: valor ? parseFloat(valor.replace('R$ ', '').replace(',', '.')) : 0,
        saldo: saldo ? parseFloat(saldo.replace('R$ ', '').replace(',', '.')) : 0,
        historico: historico.trim(),
        dataCadastro: new Date().toISOString()
      };

      console.log('Dados do paciente:', paciente);

      const salvou = await savePatient(paciente);
      
      if (salvou) {
        console.log('✅ Paciente salvo com sucesso!');
        
        // Limpa o formulário
        limparFormulario();
        
        // Mostra mensagem de sucesso
        setMensagemSucesso(`✅ ${nome} cadastrado com sucesso!`);
        setShowSnackbar(true);
        
        // Navega após 2 segundos
        setTimeout(() => {
          navigation.navigate('ListaPacientes');
        }, 2000);
        
      } else {
        setMensagemErro('❌ Falha ao salvar no banco de dados');
        setShowErrorSnackbar(true);
      }
    } catch (error) {
      console.error('Erro completo:', error);
      setMensagemErro('⚠️ Ocorreu um problema inesperado');
      setShowErrorSnackbar(true);
    } finally {
      setSalvando(false);
    }
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
            mode="outlined"
            style={{ marginBottom: 15 }}
                      
          />

          <TextInputMask
            type={'cpf'}
            value={cpf}
            onChangeText={setCpf}
            customTextInput={TextInput}
            customTextInputProps={{
              label: "CPF *",
              mode: "outlined",
              style: { marginBottom: 15 }
            }}
          />

          <TextInputMask
            type={'cel-phone'}
            options={{ maskType: 'BRL', withDDD: true }}
            value={telefone}
            onChangeText={setTelefone}
            customTextInput={TextInput}
            customTextInputProps={{
              label: "Telefone *",
              mode: "outlined",
              style: { marginBottom: 15 },
              keyboardType: 'phone-pad'
            }}
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

          <Button
            mode="contained"
            onPress={handleSalvar}
            loading={salvando}
            disabled={salvando}
            style={{ marginTop: 10, paddingVertical: 8 }}
            labelStyle={{ fontSize: 16 }}
          >
            {salvando ? 'Salvando...' : 'Salvar Cadastro'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
        action={{
          label: 'Ver Lista',
          onPress: () => {
            setShowSnackbar(false);
            navigation.navigate('ListaPacientes');
          },
        }}
      >
        {mensagemSucesso}
      </Snackbar>

      {/* Snackbar para mensagens de erro */}
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