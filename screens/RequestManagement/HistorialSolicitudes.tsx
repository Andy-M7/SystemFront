import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import axios, { AxiosError } from 'axios';
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
  pdfDisponible?: boolean;
}

const COLS = [
  { key: 'id', label: 'ID', width: 60 },
  { key: 'cliente', label: 'Cliente', width: 110 },
  { key: 'fecha', label: 'Fecha', width: 95 },
  { key: 'ultima_actualizacion', label: 'Actualización', width: 110 },
  { key: 'estado', label: 'Estado', width: 90 },
  { key: 'version', label: 'Versión', width: 65 },
  { key: 'ajustada', label: 'Ajustada', width: 95 },
  { key: 'pdf', label: 'PDF', width: 65 },
];

const TablaHeader = () => (
  <View style={styles.row}>
    {COLS.map(col => (
      <Text key={col.key} style={[styles.cell, styles.headerCell, { width: col.width }]}>
        {col.label}
      </Text>
    ))}
  </View>
);

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

      const solicitudesConPDF = await Promise.all(
        response.data.map(async (solicitud: Solicitud) => {
          try {
            await axios.head(`${BASE_URL}/pdfs/solicitud_${solicitud.id}.pdf`);
            return { ...solicitud, pdfDisponible: true };
          } catch (error) {
            return { ...solicitud, pdfDisponible: false };
          }
        })
      );
      setSolicitudes(solicitudesConPDF);
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
    const url = `${BASE_URL}/pdfs/solicitud_${id}.pdf`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el PDF de la solicitud.');
    }
  };

  const renderItem = ({ item }: { item: Solicitud }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { width: COLS[0].width }]}>{item.id}</Text>
      <Text style={[styles.cell, { width: COLS[1].width }]}>{item.cliente}</Text>
      <Text style={[styles.cell, { width: COLS[2].width }]}>{item.fecha}</Text>
      <Text style={[styles.cell, { width: COLS[3].width }]}>{item.ultima_actualizacion}</Text>
      <Text style={[styles.cell, { width: COLS[4].width }]}>{item.estado}</Text>
      <Text style={[styles.cell, { width: COLS[5].width }]}>{item.version}</Text>
      <Text
        style={[
          styles.cell,
          {
            width: COLS[6].width,
            color: item.ajustada ? '#E74C3C' : '#888',
            fontWeight: item.ajustada ? 'bold' : 'normal',
          }
        ]}
      >
        {/* SIEMPRE "Sí" o "No", por defecto "No" */}
        {item.ajustada ? 'Sí' : 'No'}
      </Text>
      <View style={[styles.cell, { width: COLS[7].width, alignItems: 'center' }]}>
        {item.pdfDisponible ? (
          <TouchableOpacity onPress={() => abrirPDFSolicitud(item.id)} style={styles.iconPDFWrap}>
            <Text style={styles.iconPDF}>📄</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPDFWrap}>
            <Text style={[styles.iconPDF, { color: '#bbb' }]}>📄</Text>
            <Text style={styles.noPDFText}>No se ha generado</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : solicitudes.length === 0 ? (
        <Text style={styles.mensaje}>Aún no ha generado solicitudes de materiales</Text>
      ) : (
        <ScrollView horizontal>
          <View>
            <TablaHeader />
            <FlatList
              data={solicitudes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default HistorialSolicitudes;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F4', padding: 8 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#DDD', alignItems: 'center', minHeight: 38, backgroundColor: '#fff' },
  cell: { padding: 5, textAlign: 'center' },
  headerCell: { fontWeight: 'bold', backgroundColor: '#eef3f7', fontSize: 13 },
  mensaje: { textAlign: 'center', fontSize: 16, marginTop: 40, color: '#555' },
  iconPDFWrap: { alignItems: 'center', justifyContent: 'center' },
  iconPDF: { fontSize: 22, color: '#007AFF' },
  noPDFText: { fontSize: 9, color: '#bbb', marginTop: 2, textAlign: 'center' },
});
