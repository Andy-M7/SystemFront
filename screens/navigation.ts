export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;

  // Empleados
  GestionarEmpleados: undefined;
  ListarEmpleados: undefined;
  RegistrarEmpleado: undefined;

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

  // 🔹 Agrega esta línea:
  DetalleSolicitud: { solicitud_id: number };
};
