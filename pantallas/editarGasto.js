import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert } from 'react-native';
import tw from 'twrnc';
import { Picker } from '@react-native-picker/picker';

const VERCEL_API_URL = 'https://api-vercel-ejei.vercel.app';

export default function EditarGasto({ route, navigation }) {
  const { transaccion } = route.params;

  const [monto, setMonto] = useState(transaccion.monto.toString());
  const [descripcion, setDescripcion] = useState(transaccion.descripcion);
  const [idCategoria, setIdCategoria] = useState(transaccion.id_categoria);
  const [idMetodoPago, setIdMetodoPago] = useState(transaccion.id_metodo_pago);
  const [categorias, setCategorias] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const fetchMetadatos = async (endpoint, setter) => {
      try {
        const response = await fetch(`${VERCEL_API_URL}${endpoint}`);
        if (!response.ok) throw new Error(`Error al cargar ${endpoint}`);
        const data = await response.json();
        setter(data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", `No se pudo cargar ${endpoint}`);
      }
    };

    fetchMetadatos('/categorias', setCategorias);
    fetchMetadatos('/metodos_pago', setMetodosPago);
  }, []);

  const actualizarGasto = async () => {
    if (!monto || !descripcion || !idCategoria || !idMetodoPago) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    setCargando(true);
    try {
      const gastoData = {
        id: transaccion.id,
        monto: parseFloat(monto),
        descripcion,
        id_categoria: idCategoria,
        id_metodo_pago: idMetodoPago,
      };

      const response = await fetch(`${VERCEL_API_URL}/transacciones/actualizar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gastoData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', result.message || 'Gasto actualizado correctamente.');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.error || 'No se pudo actualizar el gasto.');
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
      <Text style={tw`text-2xl font-bold mb-6 text-center`}>
        Editar Gasto - ID: {transaccion.id}
      </Text>

      <Text style={tw`text-base font-semibold mb-1`}>Monto ($)</Text>
      <TextInput
        style={tw`border p-3 mb-4 rounded-lg bg-white`}
        value={monto}
        onChangeText={setMonto}
        keyboardType="numeric"
      />

      <Text style={tw`text-base font-semibold mb-1`}>Descripción</Text>
      <TextInput
        style={tw`border p-3 mb-4 rounded-lg bg-white`}
        value={descripcion}
        onChangeText={setDescripcion}
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
        title={cargando ? "Actualizando..." : "Guardar Cambios"}
        onPress={actualizarGasto}
        disabled={cargando}
        color="#3b82f6"
      />
      <View style={tw`h-10`} />
    </ScrollView>
  );
}
