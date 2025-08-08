import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type GestionarLogisticaNavigationProp = StackNavigationProp<RootStackParamList, 'GestionarLogistica'>;

interface Props {
  navigation: GestionarLogisticaNavigationProp;
}

const GestionarLogistica: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Logística</Text>

      {/* Visualizar Solicitudes Pendientes */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SolicitudesPendientesLogistica')}
      >
        <Ionicons name="document-text-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Visualizar Solicitudes Pendientes</Text>
      </TouchableOpacity>

      {/* Generar Reporte por Estado */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('HistorialSolicitudes')}
      >
        <Ionicons name="bar-chart-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Generar Reporte por Estado</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#20B2AA',
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '90%',
    borderRadius: 12,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GestionarLogistica;
