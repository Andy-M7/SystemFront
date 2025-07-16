import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { BASE_URL } from '../conexion'; // ✅ Importar desde archivo central

const ImportarProductos = () => {
  const [cargando, setCargando] = useState(false);

  const seleccionarArchivo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      const file = result.assets?.[0];

      if (!file || !file.uri || !file.name) {
        Alert.alert('Operación cancelada o archivo inválido');
        return;
      }

      if (!file.name.match(/\.(xls|xlsx)$/i)) {
        Alert.alert('Formato incorrecto', 'El archivo debe ser .xls o .xlsx');
        return;
      }

      setCargando(true);

      const fileBase64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch(`${BASE_URL}/api/productos/importar-productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreArchivo: file.name,
          base64: fileBase64,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const status = response.status;

      if (contentType.includes('application/json')) {
        const data = await response.json();

        if (response.ok) {
          Alert.alert('Importación exitosa', data.mensaje || 'Productos importados correctamente.');
        } else if (data.errores) {
          Alert.alert('Errores encontrados', data.errores.join('\n'));
        } else {
          Alert.alert('Error inesperado', data.mensaje || 'No se pudo importar el archivo.');
        }
      } else {
        const text = await response.text();
        console.warn('❗Respuesta inesperada:', text);
        Alert.alert(
          `Error del servidor (HTTP ${status})`,
          'El servidor devolvió un contenido no válido.\n\n' + text
        );
      }
    } catch (error) {
      console.error('Error al importar:', error);
      Alert.alert('Error al importar archivo', String(error));
    } finally {
      setCargando(false);
    }
  };

  const descargarPlantilla = async () => {
    try {
      setCargando(true);

      const url = 'http://baxperu.com/prueba/appPrueba/plantilla-productos.xlsx';
      const nombreArchivo = 'plantilla-productos.xlsx';

      if (Platform.OS === 'android') {
        const permiso = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permiso.granted) {
          Alert.alert('Permiso requerido', 'Se necesita acceso al almacenamiento para guardar la plantilla.');
          return;
        }

        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
          permiso.directoryUri,
          nombreArchivo,
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        const response = await fetch(url);
        const blob = await response.blob();

        const reader = new FileReader();
        reader.onload = async () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            if (base64) {
              await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              Alert.alert('Éxito', 'La plantilla fue guardada correctamente.');
            }
          } else {
            Alert.alert('Error', 'No se pudo procesar el archivo descargado (tipo inesperado).');
          }
        };

        reader.readAsDataURL(blob);
      } else {
        const destino = FileSystem.documentDirectory + nombreArchivo;
        const download = await FileSystem.downloadAsync(url, destino);

        if (download.status !== 200) {
          Alert.alert('Error', 'No se pudo descargar la plantilla.');
          return;
        }

        Alert.alert('Éxito', 'Plantilla descargada correctamente.');
      }
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      Alert.alert('Error', 'Hubo un problema al guardar la plantilla.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Importar Productos</Text>

      <TouchableOpacity
        style={[styles.button, styles.greenButton]}
        onPress={seleccionarArchivo}
      >
        <Ionicons name="document-attach-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Seleccionar archivo Excel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.blueButton]}
        onPress={descargarPlantilla}
      >
        <Ionicons name="download-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Descargar plantilla</Text>
      </TouchableOpacity>

      {cargando && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Procesando...</Text>
        </View>
      )}
    </View>
  );
};

export default ImportarProductos;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  greenButton: {
    backgroundColor: '#34C759',
  },
  blueButton: {
    backgroundColor: '#007AFF',
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loading: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
});
