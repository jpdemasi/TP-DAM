import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert } from 'react-native';
import tw from 'twrnc';
import { Picker } from '@react-native-picker/picker';

const VERCEL_API_URL = 'https://api-vercel-ejei.vercel.app';

export default function CrearGasto({ route, navigation }) {
  const { usuarioId } = route.params;

  const [categorias, setCategorias] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idCategoria, setIdCategoria] = useState(null);
  const [idMetodoPago, setIdMetodoPago] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchMetadatos = async (endpoint, setter, idSetter) => {
      try {
        const response = await fetch(`${VERCEL_API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`Error al cargar ${endpoint}`);
        const data = await response.json();
        setter(data);
        if (data.length > 0) idSetter(data[0].id);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", `No se pudo cargar ${endpoint}`);
      }
    };

    fetchMetadatos('/categorias', setCategorias, setIdCategoria);
    fetchMetadatos('/metodos_pago', setMetodosPago, setIdMetodoPago);
  }, []);

  const registrarGasto = async () => {
    if (!monto || !descripcion || !idCategoria || !idMetodoPago) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    setCargando(true);
    try {
      const gastoData = {
        user_id: usuarioId,
        monto: parseFloat(monto),
        descripcion,
        id_categoria: idCategoria,
        id_metodo_pago: idMetodoPago,
        fecha: new Date().toISOString().split('T')[0],
      };

      const response = await fetch(`${VERCEL_API_URL}/transacciones/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gastoData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', result.message || 'Gasto registrado correctamente.');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.error || 'No se pudo registrar el gasto.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de Red', 'Fallo al conectar con la API.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={tw`flex-1 p-5 bg-gray-50`}>
      <Text style={tw`text-2xl font-bold mb-6 text-gray-800 text-center`}>Nuevo Registro</Text>

      <Text style={tw`text-base font-semibold mb-1`}>Monto ($)</Text>
      <TextInput
        style={tw`border p-3 mb-4 rounded-lg bg-white`}
        value={monto}
        onChangeText={setMonto}
        keyboardType="numeric"
        placeholder="Ej: 45.50"
      />

      <Text style={tw`text-base font-semibold mb-1`}>Descripción</Text>
      <TextInput
        style={tw`border p-3 mb-4 rounded-lg bg-white`}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Ej: Almuerzo en el centro"
        maxLength={100}
      />

      <Text style={tw`text-base font-semibold mb-1`}>Categoría</Text>
      <View style={tw`border rounded-lg mb-4 bg-white`}>
        <Picker selectedValue={idCategoria} onValueChange={setIdCategoria}>
          {categorias.map((cat) => (
            <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
          ))}
        </Picker>
      </View>

      <Text style={tw`text-base font-semibold mb-1`}>Método de Pago</Text>
      <View style={tw`border rounded-lg mb-6 bg-white`}>
        <Picker selectedValue={idMetodoPago} onValueChange={setIdMetodoPago}>
          {metodosPago.map((met) => (
            <Picker.Item key={met.id} label={met.nombre} value={met.id} />
          ))}
        </Picker>
      </View>

      <Button
        title={cargando ? "Registrando..." : "Guardar Gasto"}
        onPress={registrarGasto}
        disabled={cargando}
        color="#22c55e"
      />
    </ScrollView>
  );
}
