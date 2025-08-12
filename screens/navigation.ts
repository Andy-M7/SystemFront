export type RootStackParamList = {
  // Auth
  Login: undefined;
  Dashboard: undefined;

  // Empleados
  GestionarEmpleados: undefined;
  ListarEmpleados: undefined;
  RegistrarEmpleado: undefined;
  // (Si usas la pantalla de búsqueda/edición por nombre)
  // BuscarEmpleado: undefined;

  // Clientes
  GestionarClientes: undefined;
  RegistrarClientes: undefined;
  ListarClientes: undefined;
  ActualizarCliente: { id: number };

  // Usuarios
  GestionarUsuarios: undefined;
  ListarUsuarios: undefined;
  RegistrarUsuario: undefined;
  ActualizarUsuario: { id: number };

  // Productos
  GestionarProductos: undefined;
  RegistrarProducto: undefined;
  VisualizarCatalogo: undefined;
  EditarProducto: { codigo: string };
  ImportarProductos: undefined;

  // Solicitudes
  GestionarSolicitudes: undefined;
  RegistrarSolicitud: undefined;
  AgregarProductos: { solicitud_id: number };
  EditarSolicitud: { solicitud_id: number };
  VisualizarSolicitudes: undefined;
  HistorialSolicitudes: undefined;
  DetalleSolicitud: { solicitud_id: number }; // 🔹

  // Logística
  GestionarLogistica: undefined;
  SolicitudesPendientesLogistica: undefined;
  GenerarReporteEstado: undefined;
};
