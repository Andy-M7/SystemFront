import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import axios from 'axios';
import { BASE_URL } from '../conexion';
import * as WebBrowser from 'expo-web-browser';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HistorialSolicitudes'>;

interface Solicitud {
  id: number;
  cliente: string;
  fecha: string;
  estado: string;
  version: number;
  ultima_actualizacion: string;
  ajustada?: boolean;
}

const HistorialSolicitudes = () => {
  const navigation = useNavigation<NavigationProp>();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  const obtenerSolicitudes = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem('usuario');
      if (!usuarioData) {
        Alert.alert('Error', 'No se encontró sesión activa.');
        return;
      }

      const usuario = JSON.parse(usuarioData);
      if (!usuario.id) {
        Alert.alert('Error', 'Usuario inválido.');
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/solicitudes/historial`, {
        params: { usuario_id: usuario.id },
      });
      setSolicitudes(response.data);
    } catch (error) {
      console.error('Error al obtener historial:', error);
      Alert.alert('Error', 'No se pudo obtener el historial de solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerSolicitudes();
  }, []);

  const abrirPDFSolicitud = async (id: number) => {
    const url = `${BASE_URL}/api/solicitudes/${id}/pdf`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el PDF de la solicitud.');
    }
  };

  const renderItem = ({ item }: { item: Solicitud }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EditarSolicitud', { solicitud_id: item.id })}
    >
      <Text style={styles.codigo}>Solicitud #{item.id}</Text>
      <Text>Cliente: {item.cliente}</Text>
      <Text>Fecha: {item.fecha}</Text>
      <Text>Última actualización: {item.ultima_actualizacion}</Text>
      <Text>Estado: {item.estado}</Text>
      <Text>Versión: {item.version}</Text>
      {item.ajustada && <Text style={styles.ajustada}>Ajustada por Logística</Text>}

      {item.estado !== 'Pendiente' && (
        <TouchableOpacity
          style={styles.pdfButton}
          onPress={() => abrirPDFSolicitud(item.id)}
        >
          <Text style={styles.pdfText}>Ver PDF</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : solicitudes.length === 0 ? (
        <Text style={styles.mensaje}>Aún no ha generado solicitudes de materiales</Text>
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default HistorialSolicitudes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  codigo: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  ajustada: {
    color: '#E74C3C',
    fontWeight: 'bold',
    marginTop: 4,
  },
  mensaje: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
    color: '#555',
  },
  pdfButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pdfText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
