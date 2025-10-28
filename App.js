//import * as React from 'react';
//import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import Inicio from './pantallas/inicio';
import GastosPrincipal from './pantallas/gastosPrincipal';
import CrearGasto from './pantallas/crearGasto';
import EditarGasto from './pantallas/editarGasto'; 


const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Inicio">
                <Stack.Screen 
                    name="Inicio" 
                    component={Inicio} 
                    options={{ headerShown: false, title: "Inicio de Sesión" }} 
                />
                <Stack.Screen 
                    name="GastosPrincipal" 
                    component={GastosPrincipal} 
                    options={{ title: 'Mis Gastos' }} 
                />
                <Stack.Screen 
                    name="CrearGasto" 
                    component={CrearGasto} 
                    options={{ title: 'Registrar Nuevo Gasto' }} 
                />
                <Stack.Screen 
                    name="EditarGasto" 
                    component={EditarGasto} 
                    options={{ title: 'Editar Gasto' }} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}