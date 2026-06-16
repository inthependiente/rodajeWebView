export interface Proyecto {
  id: number;
  productora: string;
  campana: string;
  direccion_productora?: string;
  logo_productora?: string;
  cliente?: string;
  color_cliente?: string;
  color_campana?: string;
}

export interface Ciudad {
  id: number;
  Nombre: string;
  lat?: number;
  long?: number;
}

export interface Llamado {
  id: number;
  proyecto_id: number;
  ciudad_id?: number;
  d_o_d?: string;
  fecha?: string;
  llamado_hora?: string;
  desayuno?: string;
  almuerzo?: string;
  cena?: string;
  notas?: string;
}

export interface Escena {
  id: number;
  llamado_id: number;
  escena: string;
  hora: string;
  descripcion: string;
  cast_nombres?: string;
  int_ext?: string;
  d_n?: string;
  locacion_id?: number;
}

export interface Locacion {
  id: number;
  locacion: string;
  direccion_loc?: string;
  url_loc?: string;
  centro_medico?: string;
  direccion_med?: string;
  url_med?: string;
}

export interface Talento {
  id: number;
  llamado_id: number;
  orden?: number;
  nombre: string;
  rol: string;
  llamado_hora?: string;
  en_set?: string;
  notas?: string;
  w_status?: string;
  locacion_id?: number;
}

export interface CrewLlamado {
  id: number;
  llamado_id: number;
  crew_id: number;
  orden?: number;
  prioridad?: number;
  crew_cargo?: string;
  crew_nombre?: string;
  crew_departamento?: string;
  crew_notas?: string;
  crew_celular?: string;
  crew_llamado_hora?: string;
}

export interface Shotlist {
  id: number; // local negative IDs or database IDs
  proyecto_id?: number;
  esc: string;
  plano: string;
  descripcion: string;
  cast_nombres?: string;
  notas?: string;
  referencia_urls?: string;
  locacion_id?: number;
  locaciones?: {
    locacion: string;
  };
}

export interface PdrRow {
  id: number; // pdr database ID or local negative ID
  orden: number;
  duracion_min: number;
  llamado_id: number;
  shotlist_id: number;
  shotlist: Shotlist;
  // Local active states for rodajeAPP
  terminado?: boolean;
  inicio_reg?: string | null; // Hora registrada de inicio/fin de toma (HH:MM or Timestamp)
}

export interface OfflineSyncAction {
  id: string; // unique GUID/timestamp
  type: 'UPDATE_PDR' | 'REORDER_PDR' | 'CREATE_SHOTLIST_PDR' | 'DELETE_SHOTLIST_PDR' | 'UPDATE_LLAMADO' | 'UPDATE_SHOTLIST';
  table: 'pdr' | 'shotlist' | 'llamados';
  recordId: number; // can be local ID
  data: any;
  timestamp: number;
}

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  selectedLlamadoId: number | null;
  mode: 'online' | 'offline';
}
