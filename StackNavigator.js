import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CadastroScreen from '../screens/CadastroScreen';
import ListaPacientesScreen from '../screens/ListaPacientesScreen';
import EditarPacienteScreen from '../screens/EditarPacienteScreen';

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
     <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Clínica Odontológica' }}
      />
      <Stack.Screen 
        name="Cadastro" 
        component={CadastroScreen} 
        options={{ title: 'Novo Paciente' }}
      />
      <Stack.Screen 
        name="ListaPacientes" 
        component={ListaPacientesScreen} 
        options={{ title: 'Pacientes Cadastrados' }}
      />
      <Stack.Screen 
        name="EditarPaciente" 
        component={EditarPacienteScreen} 
        options={{ title: 'Editar Paciente' }}
      />
    </Stack.Navigator>
  );
}