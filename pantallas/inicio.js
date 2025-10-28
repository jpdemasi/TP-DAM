import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

export default function Inicio({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [colorMensaje, setColorMensaje] = useState('red');

  const VERCEL_API_URL = 'https://api-vercel-ejei.vercel.app';


  useEffect(() => {
    const checkSession = async () => {
      const storedUser = await AsyncStorage.getItem('usuario');
      if (storedUser) {
        navigation.navigate('GastosPrincipal', { usuario: JSON.parse(storedUser) });
      }
    };
    checkSession();
  }, [navigation]);

  const iniciarSesion = async () => {
    setMensaje('');

    try {
      const response = await fetch(`${VERCEL_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, clave }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('Inicio de sesión exitoso');
        setColorMensaje('green');
        await AsyncStorage.setItem('usuario', JSON.stringify(data.user));  // Guardar usuario
        navigation.navigate('GastosPrincipal', { usuario: data.user });
      } else {
        setMensaje(data.message || 'Error al iniciar sesión. Verifica usuario y clave.');
        setColorMensaje('red');
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      setMensaje('Error de red. Intente de nuevo.');
      setColorMensaje('red');
    }
  };

  // Cerrar sesión (opcional)
  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('usuario');
    setMensaje('Sesión cerrada correctamente');
    setColorMensaje('green');
    // Volver a la pantalla de login
    navigation.navigate('Inicio');
  };

  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-100 p-5`}>
      <View style={tw`bg-white p-5 rounded-lg w-full max-w-sm shadow-xl`}>
        <Text style={tw`text-3xl font-bold mb-6 text-center text-blue-600`}>Mi Gestor de Gastos</Text>
        <TextInput
          style={tw`border border-gray-300 p-3 mb-4 rounded-lg bg-white`}
          value={usuario}
          onChangeText={setUsuario}
          placeholder="Usuario (Email o Nombre)"
        />
        <TextInput
          style={tw`border border-gray-300 p-3 mb-6 rounded-lg bg-white`}
          value={clave}
          onChangeText={setClave}
          placeholder="Contraseña"
          secureTextEntry
        />
        {mensaje !== '' && (
          <Text style={tw`mb-4 text-center font-semibold text-${colorMensaje}-600`}>{mensaje}</Text>
        )}
        <Button title="Ingresar" onPress={iniciarSesion} color="#3b82f6" />
      </View>
      {/* Botón de cerrar sesión (opcional) */}
      <Button title="Cerrar sesión" onPress={cerrarSesion} color="#e63946" />
    </View>
  );
}
