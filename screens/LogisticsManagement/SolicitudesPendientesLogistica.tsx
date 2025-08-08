import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Modal, Button, Alert, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// IMPORTA tu BASE_URL
import { BASE_URL } from '../conexion';

// Tipos de datos
type Solicitud = {
  id: number;
  cliente: string;
  fecha: string;
  usuario: string;
  estado: 'Enviada' | 'Aprobada' | 'Rechazada' | string;
  version: number;
};

type DetalleItem = {
  id: number;
  producto_codigo: string;
  cantidad: number;
  observacion: string | null;
};

// Endpoints
const LOGISTICA_ENDPOINT = `${BASE_URL}/api/solicitudes/logistica`;
const DETALLE_ENDPOINT = (solicitudId: number | string): string => `${BASE_URL}/api/solicitudes/detalle/${solicitudId}`;
const EDIT_DETALLE_LOG = (detalleId: number | string): string => `${BASE_URL}/api/solicitudes/logistica/detalle/${detalleId}`;
const APROBAR_SOLICITUD = (solicitudId: number | string): string => `${BASE_URL}/api/solicitudes/${solicitudId}/aprobar`;

const ESTADOS = [
  { value: 'Enviada', label: 'Enviada' },
  { value: 'Aprobada', label: 'Aprobada' },
  { value: 'Rechazada', label: 'Rechazada' }
];

// Props para modal detalle solicitud (sin onAdded ni onDeleted)
interface DetalleSolicitudModalProps {
  visible: boolean;
  onClose: () => void;
  solicitud: Solicitud | null;
  items: DetalleItem[];
  loading: boolean;
  subtotal: number;
  formatFecha: (iso: string) => string;
  onEdited: () => void;
  onApproved: () => void;
}

const SolicitudesPendientesLogistica: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [listado, setListado] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cliente, setCliente] = useState<string>('');
  const [estado, setEstado] = useState<string>('Enviada');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [detalle, setDetalle] = useState<Solicitud | null>(null);
  const [detalleItems, setDetalleItems] = useState<DetalleItem[]>([]);
  const [detalleLoading, setDetalleLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const clienteFilterRef = useRef<string>(cliente);
  useEffect(() => { clienteFilterRef.current = cliente; }, [cliente]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (clienteFilterRef.current === cliente) cargarSolicitudes();
    }, 350);
    return () => clearTimeout(t);
  }, [cliente, estado, fechaInicio, fechaFin]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let url = LOGISTICA_ENDPOINT + '?';
      if (cliente) url += `cliente=${encodeURIComponent(cliente)}&`;
      if (estado) url += `estado=${encodeURIComponent(estado)}&`;
      if (fechaInicio) url += `fecha_ini=${encodeURIComponent(fechaInicio)}&`;
      if (fechaFin) url += `fecha_fin=${encodeURIComponent(fechaFin)}&`;
      url = url.endsWith('&') ? url.slice(0, -1) : url;

      console.log('Fetching solicitudes con URL:', url);

      const resp = await fetch(url);
      if (!resp.ok) {
        const err = await safeJson(resp);
        throw new Error(err?.message || 'Error al obtener solicitudes');
      }
      const data: Solicitud[] = await resp.json();
      setListado((data || []).sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      ));
    } catch (err: any) {
      setListado([]);
      setErrorMsg(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarSolicitudes();
  };

  const limpiarFiltros = () => {
    setCliente('');
    setEstado('Enviada');
    setFechaInicio('');
    setFechaFin('');
  };

  const formatFecha = (iso: string): string => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  useEffect(() => {
    if (detalle?.id) {
      cargarDetalle(detalle.id);
    } else {
      setDetalleItems([]);
      setErrorMsg('');
      setDetalleLoading(false);
    }
  }, [detalle]);

  const cargarDetalle = async (solicitudId: number) => {
    setDetalleLoading(true);
    setErrorMsg('');
    try {
      const resp = await fetch(DETALLE_ENDPOINT(solicitudId));
      if (!resp.ok) {
        const err = await safeJson(resp);
        throw new Error(err?.message || 'Error al obtener detalle');
      }
      const items: DetalleItem[] = await resp.json();
      setDetalleItems(Array.isArray(items) ? items : []);
    } catch (e: any) {
      setDetalleItems([]);
      setErrorMsg(e.message || 'Error inesperado al cargar detalle');
    } finally {
      setDetalleLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Solicitud }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setDetalle(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.solicitudId}>#{item.id}</Text>
        <Ionicons name="eye-outline" size={22} color="#444" />
      </View>
      <Text style={styles.info}><Text style={styles.label}>Cliente:</Text> {item.cliente}</Text>
      <Text style={styles.info}><Text style={styles.label}>Fecha:</Text> {formatFecha(item.fecha)}</Text>
      <Text style={styles.info}><Text style={styles.label}>Usuario:</Text> {item.usuario}</Text>
      <Text style={styles.info}><Text style={styles.label}>Estado:</Text> {item.estado}</Text>
      <Text style={styles.info}><Text style={styles.label}>Versión:</Text> {item.version}</Text>
    </TouchableOpacity>
  );

  const subtotalItems = useMemo<number>(() => {
    try {
      return detalleItems.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
    } catch {
      return 0;
    }
  }, [detalleItems]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Solicitudes Pendientes por Aprobar</Text>
      <Filtros
        cliente={cliente}
        setCliente={setCliente}
        estado={estado}
        setEstado={setEstado}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        limpiarFiltros={limpiarFiltros}
      />
      {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1ABC9C" />
        </View>
      ) : (
        <FlatList
          data={listado}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30, marginTop: 10, flexGrow: 1 }}
          ListEmptyComponent={
            <Text style={styles.mensajeVacio}>No hay solicitudes pendientes por atender.</Text>
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
      <DetalleSolicitudModal
        visible={!!detalle}
        onClose={() => setDetalle(null)}
        solicitud={detalle}
        items={detalleItems}
        loading={detalleLoading}
        subtotal={subtotalItems}
        formatFecha={formatFecha}
        onEdited={() => detalle && cargarDetalle(detalle.id)}
        onApproved={() => {
          setDetalle(null);
          cargarSolicitudes();
        }}
      />
    </View>
  );
};


const DetalleSolicitudModal: React.FC<DetalleSolicitudModalProps> = ({
  visible, onClose, solicitud, items, loading, subtotal,
  formatFecha, onEdited, onApproved
}) => {
  const [err, setErr] = useState<string>('');
  const editable = solicitud?.estado === 'Enviada';

  // Eliminamos estados y funciones para agregar y eliminar productos porque no se usarán

  const editItem = async (detalleId: number, newCantidad: string, newObs: string) => {
    if (!Number.isFinite(Number(newCantidad)) || Number(newCantidad) <= 0) {
      Alert.alert('Cantidad inválida', 'Debe ser un número positivo.');
      return;
    }
    try {
      const resp = await fetch(EDIT_DETALLE_LOG(detalleId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: Number(newCantidad), observacion: newObs || null })
      });
      const data = await safeJson(resp);
      if (!resp.ok) throw new Error(data?.message || 'No se pudo editar el producto');
      onEdited && onEdited();
      setErr('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo editar');
    }
  };

  const approveSolicitud = async () => {
    Alert.alert('Aprobar solicitud', '¿Confirmas aprobar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aprobar',
        onPress: async () => {
          try {
            const resp = await fetch(APROBAR_SOLICITUD(solicitud!.id), { method: 'POST' });
            const data = await safeJson(resp);
            if (!resp.ok) throw new Error(data?.message || 'No se pudo aprobar la solicitud');
            onApproved && onApproved();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo aprobar');
          }
        }
      }
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBoxWide}>
          {solicitud ? (
            <>
              <Text style={styles.detalleTitulo}>Solicitud #{solicitud.id}</Text>
              <Text style={styles.info}>Cliente: {solicitud.cliente}</Text>
              <Text style={styles.info}>Fecha: {formatFecha(solicitud.fecha)}</Text>
              <Text style={styles.info}>Usuario: {solicitud.usuario}</Text>
              <Text style={styles.info}>Estado actual: {solicitud.estado}</Text>
              <Text style={styles.info}>Versión: {solicitud.version}</Text>

              <View style={{ height: 10 }} />
              <Text style={[styles.label, { marginBottom: 6 }]}>Productos</Text>

              {loading ? (
                <View style={styles.centerRow}>
                  <ActivityIndicator size="small" color="#1ABC9C" />
                  <Text style={{ marginLeft: 8 }}>Cargando detalle…</Text>
                </View>
              ) : items.length === 0 ? (
                <Text style={styles.mensajeVacio}>No hay productos en esta solicitud.</Text>
              ) : (
                <FlatList
                  data={items}
                  keyExtractor={(it) => it.id.toString()}
                  renderItem={({ item }) => (
                    <ItemDetalleRow
                      item={item}
                      editable={editable}
                      onSave={(cant, obs) => editItem(item.id, cant, obs)}
                      // No pasamos onDelete porque no se podrá eliminar
                      onDelete={() => { /* no-op */ }}
                    />
                  )}
                  style={{ maxHeight: 260 }}
                />
              )}

              <View style={{ marginTop: 10 }}>
                <Text style={styles.info}><Text style={styles.label}>Total unidades:</Text> {subtotal}</Text>
              </View>

              <View style={{ height: 16 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Button title="Cerrar" onPress={onClose} color="#8E8E93" />
                </View>
                {editable ? (
                  <View style={{ flex: 1 }}>
                    <Button title="Aprobar" color="#34C759" onPress={approveSolicitud} />
                  </View>
                ) : null}
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

// Actualizamos ItemDetalleRow para eliminar botón eliminar y dejar solo editar
interface ItemDetalleRowProps {
  item: DetalleItem;
  editable: boolean;
  onSave: (cantidad: string, observacion: string) => Promise<void>;
  onDelete?: () => void; // opcional, lo ignoramos
}

const ItemDetalleRow: React.FC<ItemDetalleRowProps> = ({ item, editable, onSave }) => {
  const [cant, setCant] = useState<string>(String(item.cantidad ?? ''));
  const [obs, setObs] = useState<string>(item.observacion ?? '');
  const [saving, setSaving] = useState<boolean>(false);

  const doSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(cant, obs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.rowItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.producto_codigo}</Text>
        <Text style={styles.rowSub}>Detalle ID: {item.id}</Text>
      </View>
      <View style={{ width: 90 }}>
        <Text style={styles.rowSub}>Cant.</Text>
        <TextInput
          value={cant}
          onChangeText={setCant}
          editable={editable}
          style={styles.rowInput}
          keyboardType="numeric"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowSub}>Obs.</Text>
        <TextInput
          value={obs}
          onChangeText={setObs}
          editable={editable}
          style={styles.rowInput}
        />
      </View>
      {editable && (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={doSave} disabled={saving} style={styles.iconBtn}>
            <Ionicons name="save-outline" size={20} color={saving ? '#aaa' : '#007AFF'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const Filtros: React.FC<{
  cliente: string;
  setCliente: React.Dispatch<React.SetStateAction<string>>;
  estado: string;
  setEstado: React.Dispatch<React.SetStateAction<string>>;
  fechaInicio: string;
  setFechaInicio: React.Dispatch<React.SetStateAction<string>>;
  fechaFin: string;
  setFechaFin: React.Dispatch<React.SetStateAction<string>>;
  limpiarFiltros: () => void;
}> = ({
  cliente, setCliente, estado, setEstado, fechaInicio, setFechaInicio, fechaFin, setFechaFin, limpiarFiltros
}) => (
  <View style={styles.filtroBox}>
    <TextInput
      placeholder="Filtrar por cliente"
      value={cliente}
      onChangeText={setCliente}
      style={styles.inputFiltro}
    />
    <View style={styles.dropdown}>
      <Text style={{ fontSize: 12 }}>Estado: </Text>
      {ESTADOS.map(opt => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => setEstado(opt.value)}
          style={[
            styles.estadoOpt,
            estado === opt.value && { backgroundColor: '#007AFF' }
          ]}
          activeOpacity={0.7}
        >
          <Text style={{
            color: estado === opt.value ? '#fff' : '#007AFF',
            fontWeight: estado === opt.value ? 'bold' : 'normal'
          }}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>

    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
      <TextInput
        placeholder="Desde (YYYY-MM-DD)"
        value={fechaInicio}
        onChangeText={setFechaInicio}
        style={styles.inputFiltroMini}
      />
      <TextInput
        placeholder="Hasta (YYYY-MM-DD)"
        value={fechaFin}
        onChangeText={setFechaFin}
        style={styles.inputFiltroMini}
      />
    </View>
    <View style={{ alignSelf: 'flex-end', marginTop: 5 }}>
      <Button title="Limpiar" color="#FF9500" onPress={limpiarFiltros} />
    </View>
  </View>
);

const safeJson = async (resp: Response): Promise<any> => {
  try { return await resp.json(); } catch { return null; }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#f0f4f8' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  card: {
    backgroundColor: '#fff', padding: 14, borderRadius: 10,
    marginBottom: 14, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  solicitudId: { fontSize: 17, fontWeight: 'bold', color: '#007AFF' },
  info: { fontSize: 15, color: '#222', marginBottom: 2 },
  label: { fontWeight: 'bold' },
  filtroBox: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 5, elevation: 1 },
  inputFiltro: { backgroundColor: '#f2f2f2', borderRadius: 8, padding: 7, marginBottom: 5 },
  inputFiltroMini: { minWidth: 110, backgroundColor: '#f2f2f2', borderRadius: 8, padding: 7, marginBottom: 2 },
  dropdown: { flexDirection: 'row', alignItems: 'center', marginVertical: 4, gap: 5 },
  estadoOpt: {
    borderWidth: 1, borderColor: '#007AFF', borderRadius: 7,
    paddingHorizontal: 9, paddingVertical: 2, marginRight: 5
  },
  mensajeVacio: { color: '#999', fontSize: 16, textAlign: 'center', marginVertical: 30 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  centerRow: { flexDirection: 'row', alignItems: 'center' },
  errorMsg: { color: '#D0021B', marginTop: 4, marginBottom: 4 },
  modalOverlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    backgroundColor: '#fff', padding: 22, borderRadius: 12,
    minWidth: 280, maxWidth: 340, elevation: 5
  },
  modalBoxWide: {
    backgroundColor: '#fff', padding: 22, borderRadius: 12,
    minWidth: 320, maxWidth: 480, width: '92%', elevation: 5, maxHeight: '90%'
  },
  detalleTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8
  },
  rowTitle: { fontWeight: 'bold', color: '#111' },
  rowSub: { fontSize: 12, color: '#666' },
  rowInput: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4,
    minWidth: 70
  },
  iconBtn: { padding: 6 }
});

export default SolicitudesPendientesLogistica;

