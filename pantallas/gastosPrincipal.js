import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Button,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const VERCEL_API_URL = 'https://api-vercel-ejei.vercel.app';

export default function GastosPrincipal({ route, navigation }) {
  const { usuario } = route.params || {};
  const usuarioId = usuario?.id;
  const nombreUsuario = usuario?.usuario || 'Invitado';

  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoEliminar, setCargandoEliminar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [idEliminar, setIdEliminar] = useState(null);

  const cargarTransacciones = async () => {
    if (!usuarioId) {
      console.error('ID de usuario no encontrado. Volviendo al inicio.');
      navigation.navigate('Inicio');
      return;
    }
    setCargando(true);
    try {
      const response = await fetch(`${VERCEL_API_URL}/transacciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: usuarioId }),
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        const sortedData = data.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setTransacciones(sortedData);
      } else {
        setTransacciones([]);
        console.warn('Error al cargar transacciones:', data.error || data.message);
        Alert.alert(
          'Error',
          data.message || 'No se pudieron cargar las transacciones. Revise la consola.'
        );
      }
    } catch (error) {
      console.error('Error de red al cargar transacciones:', error);
      Alert.alert(
        'Error de Red',
        'Fallo al conectar con la API. Revise su conexión o el estado de Vercel.'
      );
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarTransacciones();
    }, [])
  );

  
  const confirmarEliminar = (id) => {
    setIdEliminar(id);
    setModalVisible(true);
  };

 
  const confirmarEliminarModal = () => {
    setModalVisible(false);
    if (idEliminar) {
      eliminarTransaccion(idEliminar);
      setIdEliminar(null);
    }
  };

  const eliminarTransaccion = async (id) => {
    setCargandoEliminar(id);
    try {
      const response = await fetch(`${VERCEL_API_URL}/transacciones/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        Alert.alert('Gasto eliminado', 'La transacción fue eliminada correctamente.');
        cargarTransacciones();
      } else {
        const error = await response.json();
        Alert.alert('Error al Eliminar', error.message || 'No se pudo eliminar el gasto.');
      }
    } catch (error) {
      console.error('Error de red al intentar eliminar:', error);
      Alert.alert('Error de Red', 'Fallo al conectar con la API.');
    } finally {
      setCargandoEliminar(null);
    }
  };

  const renderTransaccionCard = ({ item }) => (
    <View style={tw`bg-white p-4 rounded-xl shadow-lg mb-4 border border-gray-200`}>
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <Text style={tw`text-3xl font-bold text-red-600`}>
          ${parseFloat(item.monto).toFixed(2)}
        </Text>
        <Text style={tw`text-sm text-gray-500`}>
          {new Date(item.fecha).toLocaleDateString('es-AR')}
        </Text>
      </View>
      <Text style={tw`text-lg font-semibold text-gray-800`}>{item.descripcion}</Text>
      <View style={tw`mt-2 pt-2 border-t border-gray-100 flex-row justify-between`}>
        <Text style={tw`text-sm text-blue-600 font-medium`}>
          Categoría: {item.nombre_categoria || 'N/A'}
        </Text>
        <Text style={tw`text-sm text-green-600 font-medium`}>
          Pago: {item.nombre_metodo_pago || 'N/A'}
        </Text>
      </View>
      <View style={tw`flex-row justify-end mt-4`}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditarGasto', { transaccion: item })}
          style={tw`bg-yellow-500 p-2 rounded-full mr-2 flex-row items-center shadow-md`}
        >
          <Ionicons name="create-outline" size={18} color="white" />
          <Text style={tw`text-white ml-1 font-bold`}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => confirmarEliminar(item.id)}
          style={tw`bg-red-600 p-2 rounded-full flex-row items-center shadow-md`}
          disabled={cargandoEliminar === item.id}
        >
          {cargandoEliminar === item.id ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="white" />
          )}
          <Text style={tw`text-white ml-1 font-bold`}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <View style={tw`p-4 bg-white shadow-md border-b border-gray-200`}>
        <Text style={tw`text-xl font-bold text-gray-800`}>Hola, {nombreUsuario}!</Text>
        <Text style={tw`text-3xl font-extrabold text-blue-600 mt-1`}>Mis Gastos</Text>
      </View>

      {cargando ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={tw`mt-2 text-gray-500`}>Cargando transacciones...</Text>
        </View>
      ) : (
        <FlatList
          data={transacciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaccionCard}
          contentContainerStyle={tw`p-4`}
          ListEmptyComponent={() => (
            <View style={tw`mt-20 items-center`}>
              <Ionicons name="wallet-outline" size={50} color={tw.color('gray-400')} />
              <Text style={tw`text-gray-500 text-lg mt-2`}>No tienes gastos registrados.</Text>
              <Text style={tw`text-gray-400 text-sm mt-1`}>¡Presiona '+' para empezar a registrar!</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('CrearGasto', { usuarioId })}
        style={tw`absolute bottom-6 right-6 bg-blue-600 w-16 h-16 rounded-full justify-center items-center shadow-xl`}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

    
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg p-6 w-80`}>
            <Text style={tw`text-lg font-bold mb-4`}>Confirmar Eliminación</Text>
            <Text style={tw`mb-6`}>
              ¿Estás seguro de que deseas eliminar esta transacción?
            </Text>
            <View style={tw`flex-row justify-end`}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <View style={tw`w-4`} />
              <Button title="Eliminar" onPress={confirmarEliminarModal} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
