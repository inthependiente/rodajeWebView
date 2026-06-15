import React, { useState, useEffect, useCallback } from "react";
import {
  Wifi,
  WifiOff,
  CheckCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  Info,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  RefreshCw,
  AlertCircle,
  Clock,
  Eye,
  Database,
  Settings,
  Pencil,
  GripVertical
} from "lucide-react";
import { PdrRow, AppConfig, OfflineSyncAction, Shotlist, Proyecto, Llamado } from "./types";

// Fallback dynamic configurations
const DEFAULT_SUPABASE_URL = "https://mvmlwelmilhitoetessx.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bWx3ZWxtaWxoaXRvZXRlc3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTYxOTksImV4cCI6MjA5NjUzMjE5OX0.1MIsmOLAZM31b1BsysxII88U6JzOQWMp5kNDRiFmCnc";

const PROYECTOS_DISPONIBLES: Proyecto[] = [
  {
    id: 1,
    productora: "Gecko Films",
    campana: "Aventura Salvaje 2026",
    direccion_productora: "Santa Cruz, Bolivia",
    logo_productora: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200&auto=format&fit=crop",
    cliente: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop",
    color_cliente: "#561d68",
    color_campana: "#14cbb5"
  },
  {
    id: 2,
    productora: "CinemArt Studio",
    campana: "Fragancia del Otoño",
    direccion_productora: "La Paz, Bolivia",
    logo_productora: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=200&auto=format&fit=crop",
    cliente: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop",
    color_cliente: "#3b82f6",
    color_campana: "#f59e0b"
  },
  {
    id: 3,
    productora: "Red Line Films",
    campana: "Sabor Urbano Pepsi",
    direccion_productora: "Cochabamba, Bolivia",
    logo_productora: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=200&auto=format&fit=crop",
    cliente: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop",
    color_cliente: "#ef4444",
    color_campana: "#10b981"
  }
];

const MOCK_PROYECTO = PROYECTOS_DISPONIBLES[0];

const MOCK_LLAMADOS_BY_PROJECT: Record<number, Llamado> = {
  1: {
    id: 42,
    proyecto_id: 1,
    d_o_d: "DÍA 1 DE 3",
    fecha: "2026-06-12",
    llamado_hora: "08:00",
    desayuno: "07:30",
    almuerzo: "13:30",
    cena: "20:00",
    notas: "Llevar ropa abrigada para Ext. Noche."
  },
  2: {
    id: 51,
    proyecto_id: 2,
    d_o_d: "DÍA 2 DE 5",
    fecha: "2026-06-13",
    llamado_hora: "07:00",
    desayuno: "06:30",
    almuerzo: "12:30",
    cena: "19:30",
    notas: "Cámara en trípode bajo condiciones de bosque húmedo."
  },
  3: {
    id: 63,
    proyecto_id: 3,
    d_o_d: "DÍA 1 DE 1",
    fecha: "2026-06-14",
    llamado_hora: "09:00",
    desayuno: "08:15",
    almuerzo: "14:00",
    cena: "21:00",
    notas: "Rodaje con atletas urbanos de skate nocturno."
  }
};

const MOCK_LLAMADO = MOCK_LLAMADOS_BY_PROJECT[1];

const INITIAL_MOCK_PDR: PdrRow[] = [
  {
    id: 1001,
    orden: 1,
    duracion_min: 25,
    llamado_id: 42,
    shotlist_id: 201,
    terminado: false,
    shotlist: {
      id: 201,
      esc: "12",
      plano: "1",
      descripcion: "General de situación. Entrada de camioneta roja en locación.",
      notas: "Usar dron para planos aéreos si el viento lo permite.",
      referencia_urls: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop"
    }
  },
  {
    id: 1002,
    orden: 2,
    duracion_min: 15,
    llamado_id: 42,
    shotlist_id: 202,
    terminado: false,
    shotlist: {
      id: 202,
      esc: "12",
      plano: "2",
      descripcion: "Primer plano de Gabriel con rostro preocupado mirando atrás.",
      notas: "Focalizar ojos. Control de reflejos del viento.",
      referencia_urls: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
    }
  },
  {
    id: 1003,
    orden: 3,
    duracion_min: 30,
    llamado_id: 42,
    shotlist_id: 203,
    terminado: false,
    shotlist: {
      id: 203,
      esc: "12",
      plano: "3",
      descripcion: "Detalle del tablero de control de la camioneta marcando falla.",
      notas: "Lente macro y luz indirecta suave.",
      referencia_urls: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=600&auto=format&fit=crop"
    }
  },
  {
    id: 1004,
    orden: 4,
    duracion_min: 20,
    llamado_id: 42,
    shotlist_id: 204,
    terminado: false,
    shotlist: {
      id: 204,
      esc: "14",
      plano: "1",
      descripcion: "Plano medio. Gabriel baja del camión con equipamiento de rodaje.",
      notas: "Cuidar continuidad de sombreado.",
      referencia_urls: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop"
    }
  }
];

const MOCK_PDR_BY_PROJECT: Record<number, PdrRow[]> = {
  1: INITIAL_MOCK_PDR,
  2: [
    {
      id: 2001,
      orden: 1,
      duracion_min: 35,
      llamado_id: 51,
      shotlist_id: 205,
      terminado: false,
      shotlist: {
        id: 205,
        esc: "14",
        plano: "2",
        descripcion: "Contraplano de la asistente entregando el monitor portátil.",
        notas: "Luz de tarde cálida. Rebote plateado.",
        referencia_urls: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop"
      }
    },
    {
      id: 2002,
      orden: 2,
      duracion_min: 20,
      llamado_id: 51,
      shotlist_id: 206,
      terminado: false,
      shotlist: {
        id: 206,
        esc: "15",
        plano: "1",
        descripcion: "Detalle de mano encendiendo la fogata en el refugio de montaña.",
        notas: "Efecto de chispas en cámara lenta.",
        referencia_urls: "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=600&auto=format&fit=crop"
      }
    }
  ],
  3: [
    {
      id: 3001,
      orden: 1,
      duracion_min: 40,
      llamado_id: 63,
      shotlist_id: 207,
      terminado: false,
      shotlist: {
        id: 207,
        esc: "21",
        plano: "1",
        descripcion: "Gran plano general de la pista de patinaje con luces neon.",
        notas: "Usar lente gran angular.",
        referencia_urls: "https://images.unsplash.com/photo-1542204172-e7052809a850?q=80&w=600&auto=format&fit=crop"
      }
    }
  ]
};

export default function App() {
  // Configuration for SQLite-Supabase simulation
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem("rodajeAPP_config_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      supabaseUrl: DEFAULT_SUPABASE_URL,
      supabaseAnonKey: DEFAULT_ANON_KEY,
      selectedLlamadoId: 42,
      mode: "online"
    };
  });

  const [entered, setEntered] = useState(false);
  const [showSupabaseSettings, setShowSupabaseSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(config.supabaseUrl);
  const [tempKey, setTempKey] = useState(config.supabaseAnonKey);
  const [tempLlamadoId, setTempLlamadoId] = useState(String(config.selectedLlamadoId));

  const [loading, setLoading] = useState(false);
  const [logMessage, setLogMessage] = useState<string | null>(null);
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine);

  // Core Data
  const [proyecto, setProyecto] = useState<Proyecto>(MOCK_PROYECTO);
  const [llamado, setLlamado] = useState<Llamado>(MOCK_LLAMADO);

  const [proyectosList, setProyectosList] = useState<Proyecto[]>(() => {
    const cached = localStorage.getItem("rodajeAPP_v2_cache_all_proyectos");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return PROYECTOS_DISPONIBLES;
  });

  const [llamadosList, setLlamadosList] = useState<Llamado[]>(() => {
    const cached = localStorage.getItem("rodajeAPP_v2_cache_all_llamados");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return Object.values(MOCK_LLAMADOS_BY_PROJECT);
  });
  const [pdrRows, setPdrRows] = useState<PdrRow[]>([]);
  const [localCompletedTimes, setLocalCompletedTimes] = useState<Record<number, string>>({});

  // Background Sincronización Log / Queue
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncAction[]>(() => {
    const saved = localStorage.getItem("rodajeAPP_queue_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Reference visualizer scrollable modal
  const [activeRefImage, setActiveRefImage] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Add shot dialog modal
  const [showAddShotModal, setShowAddShotModal] = useState(false);
  const [newShotData, setNewShotData] = useState({
    esc: "12",
    plano: "",
    descripcion: "",
    duracion_min: 15,
    notas: "",
    referencia_urls: ""
  });
  const [selectedShotlistId, setSelectedShotlistId] = useState<number | null>(null);

  // Master Shotlist library collection
  const [shotlistLibrary, setShotlistLibrary] = useState<Shotlist[]>(() => [
    {
      id: 201,
      proyecto_id: 1,
      esc: "12",
      plano: "1",
      descripcion: "General de situación. Entrada de camioneta roja en locación.",
      notas: "Usar dron para planos aéreos si el viento lo permite.",
      referencia_urls: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 202,
      proyecto_id: 1,
      esc: "12",
      plano: "2",
      descripcion: "Primer plano de Gabriel con rostro preocupado mirando atrás.",
      notas: "Focalizar ojos. Control de reflejos del viento.",
      referencia_urls: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 203,
      proyecto_id: 1,
      esc: "12",
      plano: "3",
      descripcion: "Detalle del tablero de control de la camioneta marcando falla.",
      notas: "Lente macro y luz indirecta suave.",
      referencia_urls: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 204,
      proyecto_id: 1,
      esc: "14",
      plano: "1",
      descripcion: "Plano medio. Gabriel baja del camión con equipamiento de rodaje.",
      notas: "Cuidar continuidad de sombreado.",
      referencia_urls: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 205,
      proyecto_id: 1,
      esc: "14",
      plano: "2",
      descripcion: "Contraplano de la asistente entregando el monitor portátil.",
      notas: "Luz de tarde cálida. Rebote plateado.",
      referencia_urls: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 206,
      proyecto_id: 1,
      esc: "15",
      plano: "1",
      descripcion: "Detalle de mano encendiendo la fogata en el refugio de montaña.",
      notas: "Efecto de chispas en cámara lenta.",
      referencia_urls: "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: 207,
      proyecto_id: 1,
      esc: "21",
      plano: "1",
      descripcion: "Gran plano general de la pista de patinaje con luces neon.",
      notas: "Usar lente gran angular.",
      referencia_urls: "https://images.unsplash.com/photo-1542204172-e7052809a850?q=80&w=600&auto=format&fit=crop"
    }
  ]);

  // Gestural iOS swipe offsets record
  const [swipeOffsets, setSwipeOffsets] = useState<Record<number, number>>({});
  const dragStartX = React.useRef<number | null>(null);
  const [activeSwipeId, setActiveSwipeId] = useState<number | null>(null);



  // Drag and drop deletion hover design feedback
  const [isBinHovered, setIsBinHovered] = useState(false);

  // Clock dynamic minutes
  const [clockMinutes, setClockMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Setup clock listener (updates once per minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClockMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update online listener
  useEffect(() => {
    const updateOnlineStatus = () => setNetworkOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Save config/queue back to disk on change
  useEffect(() => {
    localStorage.setItem("rodajeAPP_config_v2", JSON.stringify(config));
    setTempUrl(config.supabaseUrl);
    setTempKey(config.supabaseAnonKey);
    setTempLlamadoId(String(config.selectedLlamadoId));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("rodajeAPP_queue_v2", JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Read raw database or cache upon loading or changing selected llamado
  const cacheKeySuffix = config.selectedLlamadoId || 42;

  const loadCachedOrFetch = useCallback(async () => {
    setLoading(true);
    setLogMessage(null);

    const cachedProyecto = localStorage.getItem(`rodajeAPP_v2_cache_proyecto_${cacheKeySuffix}`);
    const cachedLlamado = localStorage.getItem(`rodajeAPP_v2_cache_llamado_${cacheKeySuffix}`);
    const cachedPdr = localStorage.getItem(`rodajeAPP_v2_cache_pdr_${cacheKeySuffix}`);
    const cachedCompTimes = localStorage.getItem(`rodajeAPP_v2_cache_compTimes_${cacheKeySuffix}`);
    const cachedShotlist = localStorage.getItem("rodajeAPP_v2_cache_all_shotlist");

    if (cachedShotlist) {
      try {
        setShotlistLibrary(JSON.parse(cachedShotlist));
      } catch (e) {
        console.warn("Error parsing cached shotlist", e);
      }
    }

    if (cachedProyecto && cachedLlamado && cachedPdr) {
      try {
        setProyecto(JSON.parse(cachedProyecto));
        setLlamado(JSON.parse(cachedLlamado));
        setPdrRows(JSON.parse(cachedPdr));
        if (cachedCompTimes) {
          setLocalCompletedTimes(JSON.parse(cachedCompTimes));
        }
        setLogMessage("Plan de Rodaje cargado desde caché local.");
      } catch (e) {
        console.error("Cache parsing error, falling back to mock", e);
      }
    } else {
      // Load initially ready robust mockups matching the selected id
      const pId = cacheKeySuffix === 51 ? 2 : cacheKeySuffix === 63 ? 3 : 1;
      const proj = PROYECTOS_DISPONIBLES.find(p => p.id === pId) || MOCK_PROYECTO;
      const llam = MOCK_LLAMADOS_BY_PROJECT[pId] || MOCK_LLAMADO;
      const rows = MOCK_PDR_BY_PROJECT[pId] || INITIAL_MOCK_PDR;

      setProyecto(proj);
      setLlamado(llam);
      setPdrRows(rows);
    }

    // Attempt silent background fetch if Online helper is set
    if (config.mode === "online" && navigator.onLine) {
      try {
        const headers = {
          "apikey": config.supabaseAnonKey,
          "Authorization": `Bearer ${config.supabaseAnonKey}`,
          "Content-Type": "application/json"
        };

        // Fetch all projects and llamados to populate the headers dynamically
        try {
          const allProjRes = await fetch(`${config.supabaseUrl}/rest/v1/proyectos?select=*`, { headers });
          if (allProjRes.ok) {
            const allProjData = await allProjRes.json();
            if (allProjData && allProjData.length > 0) {
              setProyectosList(allProjData);
              localStorage.setItem("rodajeAPP_v2_cache_all_proyectos", JSON.stringify(allProjData));
            }
          }
        } catch (projErr) {
          console.warn("Could not fetch all proyectos", projErr);
        }

        try {
          const allLlamRes = await fetch(`${config.supabaseUrl}/rest/v1/llamados?select=*`, { headers });
          if (allLlamRes.ok) {
            const allLlamData = await allLlamRes.json();
            if (allLlamData && allLlamData.length > 0) {
              setLlamadosList(allLlamData);
              localStorage.setItem("rodajeAPP_v2_cache_all_llamados", JSON.stringify(allLlamData));
            }
          }
        } catch (llamErr) {
          console.warn("Could not fetch all llamados", llamErr);
        }

        try {
          const allShotRes = await fetch(`${config.supabaseUrl}/rest/v1/shotlist?select=*`, { headers });
          if (allShotRes.ok) {
            const allShotData = await allShotRes.json();
            if (allShotData && allShotData.length > 0) {
              setShotlistLibrary(allShotData);
              localStorage.setItem("rodajeAPP_v2_cache_all_shotlist", JSON.stringify(allShotData));
            }
          }
        } catch (shotErr) {
          console.warn("Could not fetch all shotlist items from library", shotErr);
        }

        const url = `${config.supabaseUrl}/rest/v1/llamados?id=eq.${cacheKeySuffix}&select=*,proyectos(*)`;
        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const activeLlamado = data[0];
            let activeProyecto = activeLlamado.proyectos || MOCK_PROYECTO;
            if (!activeLlamado.proyectos) {
              const foundProj = proyectosList.find(p => p.id === activeLlamado.proyecto_id);
              if (foundProj) {
                activeProyecto = foundProj;
              }
            }
            setLlamado(activeLlamado);
            setProyecto(activeProyecto);

            // Fetch list in order
            const pdrUrl = `${config.supabaseUrl}/rest/v1/pdr?llamado_id=eq.${cacheKeySuffix}&select=id,orden,duracion_min,status,shotlist_id,shotlist(id,esc,plano,descripcion,cast_nombres,notas,referencia_urls)&order=orden.asc`;
            const pdrRes = await fetch(pdrUrl, { headers });
            if (pdrRes.ok) {
              const pdrData = await pdrRes.json();
              const parsed: PdrRow[] = pdrData.map((p: any) => ({
                id: p.id,
                orden: p.orden,
                duracion_min: p.duracion_min || 15,
                llamado_id: cacheKeySuffix,
                shotlist_id: p.shotlist_id,
                terminado: !!p.status,
                shotlist: {
                  id: p.shotlist?.id || Math.floor(Math.random() * 100000),
                  esc: p.shotlist?.esc || "12",
                  plano: p.shotlist?.plano || "1",
                  descripcion: p.shotlist?.descripcion || "Plano sin descripción",
                  cast_nombres: p.shotlist?.cast_nombres || "",
                  notas: p.shotlist?.notas || "",
                  referencia_urls: p.shotlist?.referencia_urls || ""
                }
              }));
              setPdrRows(parsed);
              setLogMessage("Sincronización silenciosa con Supabase completada.");

              // Save to device cache
              localStorage.setItem(`rodajeAPP_v2_cache_proyecto_${cacheKeySuffix}`, JSON.stringify(activeProyecto));
              localStorage.setItem(`rodajeAPP_v2_cache_llamado_${cacheKeySuffix}`, JSON.stringify(activeLlamado));
              localStorage.setItem(`rodajeAPP_v2_cache_pdr_${cacheKeySuffix}`, JSON.stringify(parsed));
            }
          }
        }
      } catch (err: any) {
        console.warn("Silent sync unable to contact Supabase:", err);
      }
    }
    setLoading(false);
  }, [cacheKeySuffix, config.supabaseUrl, config.supabaseAnonKey, config.mode]);

  useEffect(() => {
    loadCachedOrFetch();
  }, [loadCachedOrFetch]);

  // Sync project & default llamado with URL search parameter "?id=X"
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get("id");
    if (queryId) {
      const pId = parseInt(queryId, 10);
      const foundProj = proyectosList.find(p => p.id === pId);
      if (foundProj) {
        setProyecto(foundProj);
        
        const related = llamadosList.filter(l => l.proyecto_id === pId);
        if (related.length > 0) {
          const isCurrentLlam_related = related.some(l => l.id === config.selectedLlamadoId);
          if (!isCurrentLlam_related) {
            const firstLlam = related[0];
            setLlamado(firstLlam);
            setConfig(prev => ({ ...prev, selectedLlamadoId: firstLlam.id }));
          } else {
            const currentLlam = related.find(l => l.id === config.selectedLlamadoId);
            if (currentLlam) {
              setLlamado(currentLlam);
            }
          }
        } else {
          const fallbackLlamId = pId === 2 ? 51 : pId === 3 ? 63 : 42;
          const fallbackLlam = llamadosList.find(l => l.id === fallbackLlamId) || MOCK_LLAMADO;
          setLlamado(fallbackLlam);
          setConfig(prev => ({ ...prev, selectedLlamadoId: fallbackLlamId }));
        }
      }
    }
  }, [proyectosList, llamadosList, config.selectedLlamadoId]);

  // Execute silent background uploads if Online
  useEffect(() => {
    if (config.mode === "online" && networkOnline && offlineQueue.length > 0) {
      const autoSyncTimer = setTimeout(() => {
        executeSync();
      }, 1000); // Debounce trigger to allow fluid drag-drops or typing
      return () => clearTimeout(autoSyncTimer);
    }
  }, [offlineQueue, config.mode, networkOnline]);

  const executeSync = async () => {
    if (!networkOnline || offlineQueue.length === 0) return;
    setLoading(true);
    let successCount = 0;
    const remainingQueue = [...offlineQueue];

    const headers = {
      "apikey": config.supabaseAnonKey,
      "Authorization": `Bearer ${config.supabaseAnonKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    };

    while (remainingQueue.length > 0) {
      const action = remainingQueue[0];
      try {
        if (action.type === "UPDATE_PDR") {
          await fetch(`${config.supabaseUrl}/rest/v1/pdr?id=eq.${action.recordId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(action.data)
          });
        } else if (action.type === "REORDER_PDR") {
          await fetch(`${config.supabaseUrl}/rest/v1/pdr?id=eq.${action.recordId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ orden: action.data.orden })
          });
        } else if (action.type === "CREATE_SHOTLIST_PDR") {
          const createShotResponse = await fetch(`${config.supabaseUrl}/rest/v1/shotlist`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              esc: action.data.esc,
              plano: action.data.plano,
              descripcion: action.data.descripcion,
              notas: action.data.notas,
              referencia_urls: action.data.referencia_urls,
              proyecto_id: proyecto?.id
            })
          });
          if (createShotResponse.ok) {
            const createdArr = await createShotResponse.json();
            const shotId = createdArr[0]?.id;
            if (shotId) {
              await fetch(`${config.supabaseUrl}/rest/v1/pdr`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  llamado_id: config.selectedLlamadoId,
                  orden: action.data.orden,
                  duracion_min: action.data.duracion_min,
                  shotlist_id: shotId
                })
              });
            }
          }
        } else if (action.type === "DELETE_SHOTLIST_PDR") {
          await fetch(`${config.supabaseUrl}/rest/v1/pdr?id=eq.${action.recordId}`, {
            method: "DELETE",
            headers
          });
        } else if (action.type === "UPDATE_LLAMADO") {
          await fetch(`${config.supabaseUrl}/rest/v1/llamados?id=eq.${action.recordId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(action.data)
          });
        } else if (action.type === "UPDATE_SHOTLIST") {
          await fetch(`${config.supabaseUrl}/rest/v1/shotlist?id=eq.${action.recordId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(action.data)
          });
        }
        successCount++;
        remainingQueue.shift();
      } catch (err) {
        console.error("Background sync error on specific action", action, err);
        break; // Retry later
      }
    }

    setOfflineQueue(remainingQueue);
    setLoading(false);
    if (successCount > 0) {
      setLogMessage(`Sincronizados ${successCount} cambios silenciosamente.`);
    }
  };

  // Enqueue changes locally immediately for extreme speed offline
  const registerChange = (action: OfflineSyncAction) => {
    setOfflineQueue((prev) => [...prev, action]);
  };

  // State state persistence helper
  const updateCachedPdr = (newRows: PdrRow[]) => {
    setPdrRows(newRows);
    localStorage.setItem(`rodajeAPP_v2_cache_pdr_${cacheKeySuffix}`, JSON.stringify(newRows));
  };

  const updateCachedCompTimes = (times: Record<number, string>) => {
    setLocalCompletedTimes(times);
    localStorage.setItem(`rodajeAPP_v2_cache_compTimes_${cacheKeySuffix}`, JSON.stringify(times));
  };

  // Inline inputs editor
  const handleInlineInputUpdate = (pdrId: number, field: string, value: any) => {
    const updated = pdrRows.map((row) => {
      if (row.id === pdrId) {
        if (field === "duracion_min") {
          const num = Math.max(1, parseInt(value, 10) || 5);
          registerChange({
            id: `up_dur_${pdrId}_${Date.now()}`,
            type: "UPDATE_PDR",
            table: "pdr",
            recordId: pdrId,
            data: { duracion_min: num },
            timestamp: Date.now()
          });
          return { ...row, duracion_min: num };
        } else {
          // Inner shotlist update
          const updatedShotlist = { ...row.shotlist, [field]: value };
          if (row.shotlist && row.shotlist.id) {
            registerChange({
              id: `up_sl_${row.shotlist.id}_${field}_${Date.now()}`,
              type: "UPDATE_SHOTLIST",
              table: "shotlist",
              recordId: row.shotlist.id,
              data: { [field]: value },
              timestamp: Date.now()
            });
          }
          return { ...row, shotlist: updatedShotlist };
        }
      }
      return row;
    });
    updateCachedPdr(updated);
  };

  // Dynamic Completed Action Toggler
  const handleToggleCompleted = (pdrId: number) => {
    const targetIndex = pdrRows.findIndex((row) => row.id === pdrId);
    if (targetIndex === -1) return;

    const rowToToggle = pdrRows[targetIndex];
    const canToggle = rowToToggle.terminado || (targetIndex === 0 ? true : pdrRows.slice(0, targetIndex).every((r) => r.terminado));
    if (!canToggle) return;

    let nextState = false;
    const updated = pdrRows.map((row) => {
      if (row.id === pdrId) {
        nextState = !row.terminado;
        if (nextState) {
          const nowStr = formatMinutesToTime(clockMinutes);
          updateCachedCompTimes({ ...localCompletedTimes, [pdrId]: nowStr });
        } else {
          const copy = { ...localCompletedTimes };
          delete copy[pdrId];
          updateCachedCompTimes(copy);
        }
        return { ...row, terminado: nextState };
      }
      return row;
    });

    registerChange({
      id: `pdr_status_${pdrId}_${Date.now()}`,
      type: "UPDATE_PDR",
      table: "pdr",
      recordId: pdrId,
      data: { status: nextState },
      timestamp: Date.now()
    });

    updateCachedPdr(updated);
  };

  // Modal states for editing description and notes
  const [editingPdrRow, setEditingPdrRow] = useState<any>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Local unsaved durations for "onBlur" persistence logic
  const [localDurations, setLocalDurations] = useState<Record<number, string>>({});

  const handleSaveModalEdits = () => {
    if (!editingPdrRow) return;
    
    const pdrId = editingPdrRow.id;
    
    // Register the change for "descripcion"
    registerChange({
      id: `shot_descripcion_${pdrId}_${Date.now()}`,
      type: "UPDATE_SHOTLIST",
      table: "shotlist",
      recordId: editingPdrRow.shotlist_id,
      data: { descripcion: editDescription },
      timestamp: Date.now()
    });

    // Register the change for "notas"
    registerChange({
      id: `shot_notas_${pdrId}_${Date.now()}`,
      type: "UPDATE_SHOTLIST",
      table: "shotlist",
      recordId: editingPdrRow.shotlist_id,
      data: { notas: editNotes },
      timestamp: Date.now()
    });

    // Update state locally
    const updated = pdrRows.map((row) => {
      if (row.id === pdrId) {
        return {
          ...row,
          shotlist: {
            ...row.shotlist,
            descripcion: editDescription,
            notas: editNotes
          }
        };
      }
      return row;
    });
    
    updateCachedPdr(updated);
    setEditingPdrRow(null);
  };

  const handleDuracionBlur = (pdrId: number, val: string) => {
    const num = Math.max(1, parseInt(val, 10) || 5);
    registerChange({
      id: `dur_${pdrId}_${Date.now()}`,
      type: "UPDATE_PDR",
      table: "pdr",
      recordId: pdrId,
      data: { duracion_min: num },
      timestamp: Date.now()
    });
  };

  // HTML5 Drag and Drop Handlers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // iPad / mobile Touch Drag-and-Drop state
  const [touchDraggedIndex, setTouchDraggedIndex] = useState<number | null>(null);

  const handleTouchStart = (index: number, e: React.TouchEvent) => {
    setTouchDraggedIndex(index);
    if (navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch (_) {}
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchDraggedIndex === null) return;

    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;

    const targetRow = elem.closest("[data-row-index]");
    if (targetRow) {
      const targetIndex = parseInt(targetRow.getAttribute("data-row-index") || "", 10);
      if (!isNaN(targetIndex) && targetIndex !== touchDraggedIndex) {
        if (e.cancelable) {
          e.preventDefault();
        }

        const items = [...pdrRows];
        const draggedItem = items[touchDraggedIndex];
        items.splice(touchDraggedIndex, 1);
        items.splice(targetIndex, 0, draggedItem);

        const updated = items.map((r, i) => ({ ...r, orden: i + 1 }));
        setPdrRows(updated);
        setTouchDraggedIndex(targetIndex);
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchDraggedIndex !== null) {
      const finalItems = [...pdrRows];
      setTouchDraggedIndex(null);

      // Register reordering actions
      finalItems.forEach((row, idx) => {
        registerChange({
          id: `ord_touch_${row.id}_${Date.now()}_idx_${idx}`,
          type: "REORDER_PDR",
          table: "pdr",
          recordId: row.id,
          data: { orden: idx + 1 },
          timestamp: Date.now()
        });
      });

      updateCachedPdr(finalItems);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    // Swap indexes locally while hovering
    const items = [...pdrRows];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);
    
    // Quick update indices
    const updated = items.map((r, i) => ({ ...r, orden: i + 1 }));
    setPdrRows(updated);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Queue synchronized indices on drag complete
    pdrRows.forEach((row, idx) => {
      registerChange({
        id: `ord_${row.id}_${Date.now()}`,
        type: "REORDER_PDR",
        table: "pdr",
        recordId: row.id,
        data: { orden: idx + 1 },
        timestamp: Date.now()
      });
    });
    // Persist finalized sequence
    updateCachedPdr(pdrRows);
  };

  const handleMoveRow = (index: number, direction: "up" | "down", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newRows = [...pdrRows];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRows.length) return;

    // Swap items
    const temp = newRows[index];
    newRows[index] = newRows[targetIndex];
    newRows[targetIndex] = temp;

    const updated = newRows.map((row, idx) => ({ ...row, orden: idx + 1 }));
    setPdrRows(updated);
    updateCachedPdr(updated);

    // Register sync changes
    updated.forEach((row, idx) => {
      registerChange({
        id: `ord_btn_${row.id}_${Date.now()}_idx_${idx}`,
        type: "REORDER_PDR",
        table: "pdr",
        recordId: row.id,
        data: { orden: idx + 1 },
        timestamp: Date.now()
      });
    });
  };

  // Pointer-based swipe handling
  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    const target = e.target as HTMLElement;
    // Don't trigger swipe if clicking inputs, inputs are interactive, or drag handles
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("[data-drag-handle]")
    ) {
      return;
    }
    dragStartX.current = e.clientX;
    setActiveSwipeId(id);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent, id: number) => {
    if (dragStartX.current === null || activeSwipeId !== id) return;
    const diff = e.clientX - dragStartX.current;
    if (diff < 0) {
      // Swiping left: maximum swipe is -100px
      const offset = Math.max(-100, diff);
      setSwipeOffsets((prev) => ({ ...prev, [id]: offset }));
    } else {
      // Swiping right: maximum swipe is 0px
      const offset = Math.min(0, diff);
      setSwipeOffsets((prev) => ({ ...prev, [id]: offset }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent, id: number) => {
    if (activeSwipeId === id) {
      const currentOffset = swipeOffsets[id] || 0;
      if (currentOffset <= -30) {
        // Snap open to reveal the iOS sub-action
        setSwipeOffsets((prev) => ({ ...prev, [id]: -80 }));
      } else {
        // Snap closed
        const copy = { ...swipeOffsets };
        delete copy[id];
        setSwipeOffsets(copy);
      }
      dragStartX.current = null;
      setActiveSwipeId(null);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Add customized shot items (Existing library or manual custom entry)
  const handleAddNewShot = (e: React.FormEvent) => {
    e.preventDefault();
    const tempPdrId = -Math.floor(Math.random() * 99999);
    
    let targetShotId: number;
    let targetShotObj: Shotlist;

    if (selectedShotlistId !== null) {
      targetShotId = selectedShotlistId;
      const found = shotlistLibrary.find(s => s.id === selectedShotlistId);
      targetShotObj = found || {
        id: targetShotId,
        esc: newShotData.esc,
        plano: newShotData.plano,
        descripcion: newShotData.descripcion,
        notas: newShotData.notas,
        referencia_urls: newShotData.referencia_urls
      };
    } else {
      targetShotId = -Math.floor(Math.random() * 99999);
      targetShotObj = {
        id: targetShotId,
        proyecto_id: proyecto?.id,
        esc: newShotData.esc || "12",
        plano: newShotData.plano || "",
        descripcion: newShotData.descripcion || "Nuevo plano añadido",
        notas: newShotData.notas || "",
        referencia_urls: newShotData.referencia_urls || "https://images.unsplash.com/photo-1542204172-e7052809a850?q=80&w=600&auto=format&fit=crop"
      };
      
      // Add newly created custom shot to selection library so it can be chosen next time
      setShotlistLibrary(prev => [targetShotObj, ...prev]);
    }

    const newRow: PdrRow = {
      id: tempPdrId,
      orden: pdrRows.length + 1,
      duracion_min: Number(newShotData.duracion_min) || 15,
      llamado_id: cacheKeySuffix,
      shotlist_id: targetShotId,
      terminado: false,
      shotlist: targetShotObj
    };

    const updated = [...pdrRows, newRow];
    updateCachedPdr(updated);

    registerChange({
      id: `add_${Date.now()}`,
      type: "CREATE_SHOTLIST_PDR",
      table: "pdr",
      recordId: tempPdrId,
      data: {
        esc: targetShotObj.esc,
        plano: targetShotObj.plano,
        descripcion: targetShotObj.descripcion,
        duracion_min: Number(newShotData.duracion_min) || 15,
        notas: targetShotObj.notas,
        referencia_urls: targetShotObj.referencia_urls,
        orden: newRow.orden,
        shotlist_id: selectedShotlistId
      },
      timestamp: Date.now()
    });

    setNewShotData({
      esc: "12",
      plano: "",
      descripcion: "",
      duracion_min: 15,
      notas: "",
      referencia_urls: ""
    });
    setSelectedShotlistId(null);
    setShowAddShotModal(false);
  };

  // Delete shot items completely
  const handleDeleteShot = (pdrId: number) => {
    if (window.confirm("¿Seguro que deseas eliminar esta toma de la shotlist?")) {
      const filtered = pdrRows.filter((r) => r.id !== pdrId);
      const reindexed = filtered.map((row, idx) => ({ ...row, orden: idx + 1 }));
      updateCachedPdr(reindexed);

      registerChange({
        id: `del_${pdrId}_${Date.now()}`,
        type: "DELETE_SHOTLIST_PDR",
        table: "pdr",
        recordId: pdrId,
        data: {},
        timestamp: Date.now()
      });
    }
  };

  // Timings algorithms
  const baseLlamadoMinutes = parseTimeToMinutes(llamado.llamado_hora || "08:00");

  function parseTimeToMinutes(tStr: string): number {
    const m = (tStr || "08:00").match(/^(\d{1,2}):(\d{2})/);
    if (!m) return 480;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }

  function formatMinutesToTime(min: number): string {
    const h = Math.floor(min / 60) % 24;
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // 1. Planificados timetable mapping
  let planCumulative = baseLlamadoMinutes;
  const rawPlanTimings = pdrRows.map((row) => {
    const start = planCumulative;
    planCumulative += row.duracion_min;
    return {
      pdrId: row.id,
      plannedStartStr: formatMinutesToTime(start),
      plannedEndStr: formatMinutesToTime(planCumulative),
      startMin: start,
      endMin: planCumulative
    };
  });

  // 2. Estimadas timetables logic matching Swift computeAllTimings exactly
  let runningEstEnd = baseLlamadoMinutes;
  const wrapEstTimings = pdrRows.map((row, idx) => {
    const planTimes = rawPlanTimings[idx] || { startMin: baseLlamadoMinutes, endMin: baseLlamadoMinutes + row.duracion_min };
    
    let origStartMin: number;
    if (idx === 0) {
      origStartMin = baseLlamadoMinutes;
    } else {
      const prevRow = pdrRows[idx - 1];
      if (prevRow.terminado && localCompletedTimes[prevRow.id]) {
        origStartMin = parseTimeToMinutes(localCompletedTimes[prevRow.id]);
      } else {
        origStartMin = runningEstEnd;
      }
    }
    
    runningEstEnd = origStartMin + row.duracion_min;
    
    let estStartStr = "";
    let estEndStr = "";
    
    if (row.terminado && localCompletedTimes[row.id]) {
      const lockedStr = localCompletedTimes[row.id];
      estStartStr = lockedStr;
      estEndStr = lockedStr;
    } else {
      const isFirstPending = idx === 0 || pdrRows[idx - 1].terminado;
      let start: number;
      if (isFirstPending) {
        const nowTime = clockMinutes;
        const schedTime = planTimes.startMin;
        const diff = nowTime - schedTime;
        if (diff > 0) {
          start = nowTime;
        } else {
          start = schedTime;
        }
      } else {
        start = runningEstEnd;
      }
      estStartStr = formatMinutesToTime(start);
      estEndStr = formatMinutesToTime(start + row.duracion_min);
    }
    
    return {
      pdrId: row.id,
      estimadaStartStr: estStartStr,
      estimadaEndStr: estEndStr,
      originalEstimadaStart: formatMinutesToTime(origStartMin)
    };
  });

  // 3. Dynamic Estado calculator logic matching Swift exactly
  const analyzeRealTimeCalculatedState = () => {
    if (pdrRows.length === 0) {
      return { text: "SIN PLANOS EN EL PLAN", class: "bg-slate-900 border-slate-700 text-zinc-300 pointer-events-none" };
    }

    // Verify if the scheduled date matched local device date
    if (llamado && llamado.fecha) {
      try {
        const targetDateStr = llamado.fecha.substring(0, 10); // Standard "YYYY-MM-DD"
        const parts = targetDateStr.split('-');
        const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : targetDateStr;
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDateStr = `${year}-${month}-${day}`;

        if (targetDateStr !== todayDateStr) {
          if (targetDateStr > todayDateStr) {
            return { text: `PROGRAMADO: ${formattedDate}`, class: "bg-indigo-950/80 border-indigo-500 text-indigo-400 font-bold" };
          } else {
            return { text: `CONCLUIDO: ${formattedDate}`, class: "bg-slate-900/90 border-slate-800 text-slate-400 font-medium" };
          }
        }
      } catch (err) {
        console.error("Error comparing dates", err);
      }
    }

    // Find first pending shot index
    const firstPendingIdx = pdrRows.findIndex((row) => !row.terminado);

    if (firstPendingIdx !== -1) {
      // a = hora de inicio planificada
      let a = baseLlamadoMinutes;
      for (let i = 0; i < firstPendingIdx; i++) {
        a += pdrRows[i].duracion_min;
      }
      
      // b = minutos "duración"
      const b = pdrRows[firstPendingIdx].duracion_min;
      
      // c = a + b (hora final planificada)
      const c = a + b;
      
      // d = hora actual
      const d = clockMinutes;
      
      if (d > c) {
        const diff = d - c;
        return { text: `${diff} MINUTOS ATRASADO`, class: "bg-rose-950/80 border-rose-500 text-rose-400 font-black font-mono tracking-wide" };
      } else if (d >= a && d <= c) {
        return { text: "RODAJE A TIEMPO", class: "bg-cyan-950/80 border-cyan-500 text-cyan-400 font-black font-mono tracking-wide" };
      } else {
        const diff = c - d;
        return { text: `${diff} MINUTOS ADELANTADO`, class: "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-black font-mono tracking-wide" };
      }
    } else {
      // Todos completados
      const lastDone = pdrRows[pdrRows.length - 1];
      if (lastDone && localCompletedTimes[lastDone.id]) {
        const actualMin = parseTimeToMinutes(localCompletedTimes[lastDone.id]);
        
        let totalPlanMin = baseLlamadoMinutes;
        for (const r of pdrRows) {
          totalPlanMin += r.duracion_min;
        }
        
        const difference = actualMin - totalPlanMin;
        if (difference === 0) {
          return { text: "RODAJE FINALIZADO A TIEMPO", class: "bg-cyan-950/80 border-cyan-500 text-cyan-400 font-black font-mono tracking-wide" };
        } else if (difference < 0) {
          return { text: `FINALIZADO: ${Math.abs(difference)} MIN ADELANTO`, class: "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-black font-mono tracking-wide" };
        } else {
          return { text: `FINALIZADO: ${difference} MIN RETRASO`, class: "bg-rose-950/80 border-rose-500 text-rose-400 font-black font-mono tracking-wide" };
        }
      }
    }

    return { text: "RODAJE INICIADO A TIEMPO", class: "bg-cyan-950/80 border-cyan-500 text-cyan-300 font-mono" };
  };

  const calculatedState = analyzeRealTimeCalculatedState();

  // Reference visual reference lightbox loader
  const triggerLightboxOpen = (selectedRow: PdrRow) => {
    const allVisualUrls = pdrRows
      .map((r) => r.shotlist?.referencia_urls)
      .join(",")
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http") || u.startsWith("https"));

    if (allVisualUrls.length > 0) {
      setImageGallery(allVisualUrls);
      const rowUr = (selectedRow.shotlist?.referencia_urls || "").split(",")[0]?.trim();
      const matchIdx = allVisualUrls.indexOf(rowUr);
      const defaultIdx = matchIdx >= 0 ? matchIdx : 0;
      setGalleryIndex(defaultIdx);
      setActiveRefImage(allVisualUrls[defaultIdx]);
    } else {
      alert("Este plano no tiene referencias de imágenes válidas guardadas.");
    }
  };

  const handlePrevGalleryImage = () => {
    if (imageGallery.length === 0) return;
    const nextIdx = (galleryIndex - 1 + imageGallery.length) % imageGallery.length;
    setGalleryIndex(nextIdx);
    setActiveRefImage(imageGallery[nextIdx]);
  };

  const handleNextGalleryImage = () => {
    if (imageGallery.length === 0) return;
    const nextIdx = (galleryIndex + 1) % imageGallery.length;
    setGalleryIndex(nextIdx);
    setActiveRefImage(imageGallery[nextIdx]);
  };

  if (!entered) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="max-w-md w-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 text-center">
          {/* Logo Cliente / Titular */}
          <div className="flex justify-center">
            <div 
              style={{ backgroundColor: proyecto?.color_cliente || '#1e1b4b' }}
              className="w-24 h-24 rounded-2xl flex items-center justify-center p-2.5 border border-slate-800/60 shadow-inner overflow-hidden"
            >
              {proyecto?.cliente && (proyecto.cliente.startsWith("http://") || proyecto.cliente.startsWith("https://")) ? (
                <img
                  src={proyecto.cliente}
                  alt="Cliente Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-center text-xs font-black text-white uppercase tracking-wider break-words line-clamp-3">
                  {proyecto?.cliente || "CLIENTE"}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-b border-slate-850/60 py-4 my-1 space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">{proyecto?.campana || "Campaña"}</h2>
            <p className="text-xs text-indigo-400 font-mono font-medium uppercase tracking-wider">{proyecto?.productora || "Productora"}</p>
          </div>

          {/* Selector de Llamados */}
          <div className="space-y-4">
            <div className="w-full text-left space-y-1.5">
              <label className="text-[10px] text-indigo-450 font-bold uppercase tracking-wider block font-mono">
                Seleccionar Llamado:
              </label>
              <select
                value={llamado.id}
                onChange={(e) => {
                  const lId = parseInt(e.target.value, 10);
                  const selectedLlam = llamadosList.find(l => l.id === lId) || llamado;
                  setLlamado(selectedLlam);
                  setConfig(prev => ({ ...prev, selectedLlamadoId: lId }));
                }}
                className="bg-slate-950 border border-slate-850/80 text-amber-400 text-sm font-bold rounded-xl px-4 py-3 w-full focus:border-indigo-500 focus:outline-none cursor-pointer font-mono shadow-inner"
              >
                {(() => {
                  const relatedLlamados = llamadosList.filter(l => l.proyecto_id === proyecto.id);
                  if (relatedLlamados.length === 0) {
                    return (
                      <option value={llamado.id} className="bg-slate-950 text-amber-400">
                        {llamado.d_o_d || `Llamado ${llamado.id}`}
                      </option>
                    );
                  }
                  return relatedLlamados.map((l) => (
                    <option key={l.id} value={l.id} className="bg-slate-955 text-amber-400">
                      {l.d_o_d || `Llamado ${l.id}`}
                    </option>
                  ));
                })()}
              </select>
            </div>

            {/* Informacion de Resumen del Llamado */}
            <div className="bg-slate-950/40 border border-slate-850/50 rounded-2xl p-4 text-left text-xs space-y-2 font-mono text-slate-400">
              <div className="flex justify-between border-b border-slate-850/40 pb-1.5">
                <span className="text-slate-500">Fecha:</span>
                <span className="text-slate-200 font-bold">
                  {(() => {
                    if (llamado && llamado.fecha) {
                      const dateStr = llamado.fecha.substring(0, 10);
                      const parts = dateStr.split('-');
                      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
                    }
                    return "-";
                  })()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-850/40 pb-1.5">
                <span className="text-slate-500">Hora de Llamado:</span>
                <span className="text-amber-400 font-bold">{llamado.llamado_hora || "08:00"}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-0.5">
                <span className="text-slate-500">Comidas:</span>
                <span className="text-slate-300">
                  🥪 {llamado.desayuno || "-"} &nbsp;&bull;&nbsp; 🍲 {llamado.almuerzo || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Boton Ingresar */}
          <div className="pt-2">
            <button
              onClick={() => setEntered(true)}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 active:scale-[0.98] text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 hover:shadow-amber-500/10 transition duration-150 uppercase tracking-widest font-sans cursor-pointer"
            >
              <span>Ingresar al Plan</span>
              <ChevronRight className="w-4 h-4 text-slate-950 shrink-0" />
            </button>
          </div>

          <div className="text-[10px] text-slate-600 font-mono text-center">
            rodajeApp v1.0 (inthependiente)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      
      {/* 3. STICKY / TOP PERSISTENT STATE BANNER CALCULATOR (Ultra clean, centered status) */}
      <div className={`sticky top-0 z-40 transition-colors backdrop-blur-md border-b flex items-center justify-center px-4 py-3 md:px-6 shadow-xl ${calculatedState.class}`}>
        {/* Simple inline computed timing status text - Centered */}
        <div className="flex items-center gap-3 justify-center text-center">
          <Clock className="w-5 h-5 shrink-0" />
          <h1 className="text-sm md:text-base font-black tracking-wide font-mono uppercase">
            {calculatedState.text}
          </h1>
        </div>
      </div>



      {/* CUSTOM SUPABASE DATABASE CONNECTION PANEL */}
      {showSupabaseSettings && (
        <div id="settings-supabase-panel" className="bg-slate-900 border-b border-slate-800 p-6 shadow-inner tracking-tight">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400 font-bold" />
                <h3 className="font-bold text-white text-base">Parámetros de Conexión Supabase (Base de datos Real)</h3>
              </div>
              <button 
                onClick={() => setShowSupabaseSettings(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-950/20 text-emerald-450 text-xs p-4 rounded-xl border border-emerald-900/40 leading-relaxed text-justify">
              <span className="font-bold block mb-1 text-emerald-300">🔌 Conectando con tu propia base de datos</span>
              Hemos analizado el esquema de tu base de datos (con las tablas <code className="text-yellow-400 font-mono font-bold">proyectos</code>, <code className="text-yellow-400 font-mono font-bold">llamados</code>, <code className="text-yellow-400 font-mono font-bold">shotlist</code> y <code className="text-yellow-400 font-mono font-bold">pdr</code>). 
              Esta aplicación web es un cliente React estático offline-first preparado para consumir directamente tu API REST de Supabase. Ingresa tus credenciales a continuación para traer y actualizar tus rodajes reales automáticamente sin intermediarios.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block font-mono uppercase">URL de tu proyecto Supabase</label>
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://su-proyecto.supabase.co"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block font-mono uppercase">Anon / Public API Key</label>
                <input
                  type="text"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Su clave pública anónima (anon/public)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono select-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">Llamado ID (ID Real):</span>
                  <input
                    type="number"
                    value={tempLlamadoId}
                    onChange={(e) => setTempLlamadoId(e.target.value)}
                    placeholder="42"
                    className="w-16 bg-slate-900 border border-slate-700 text-amber-400 text-xs font-black rounded text-center py-1 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">ID del registro en tu tabla <code className="text-slate-450 font-mono">llamados</code></p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    setTempUrl(DEFAULT_SUPABASE_URL);
                    setTempKey(DEFAULT_ANON_KEY);
                    setTempLlamadoId("42");
                    setConfig({
                      supabaseUrl: DEFAULT_SUPABASE_URL,
                      supabaseAnonKey: DEFAULT_ANON_KEY,
                      selectedLlamadoId: 42,
                      mode: "online"
                    });
                    setLogMessage("Restablecido a la base de datos de demostración.");
                    setShowSupabaseSettings(false);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition"
                >
                  Restablecer Demo
                </button>

                <button
                  onClick={() => {
                    const cleanUrl = tempUrl.trim();
                    const cleanKey = tempKey.trim();
                    const cleanId = parseInt(tempLlamadoId, 10) || 42;
                    
                    if (!cleanUrl || !cleanKey) {
                      setLogMessage("Por favor rellena todos los campos con tus claves validas.");
                      return;
                    }

                    // Clear existing device cache for this id to force rewrite
                    localStorage.removeItem(`rodajeAPP_v2_cache_proyecto_${cleanId}`);
                    localStorage.removeItem(`rodajeAPP_v2_cache_llamado_${cleanId}`);
                    localStorage.removeItem(`rodajeAPP_v2_cache_pdr_${cleanId}`);

                    setConfig({
                      supabaseUrl: cleanUrl,
                      supabaseAnonKey: cleanKey,
                      selectedLlamadoId: cleanId,
                      mode: "online"
                    });
                    setLogMessage("Parámetros guardados correctamente. Conectando a Supabase...");
                    setShowSupabaseSettings(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-900/10 active:scale-95 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar & Conectar en Vivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE IPAD RODAJELISTER TIMELINE COMPACT FRAME */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 flex flex-col gap-6">

        {/* CORE INTERACTIVE SHOT LIST - EXCLUSIVE DRAG AND DROP HANDLER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col justify-between">
          <div>
            <div className="bg-slate-950/60 px-4 py-3 border-b border-slate-850 flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold tracking-wider uppercase">PLAN DE RODAJE</span>
              <button
                onClick={() => setEntered(false)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 hover:bg-[#1f1a4a]/40 rounded border border-indigo-900/40 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Volver a Inicio</span>
              </button>
            </div>

            {/* VISTA DESKTOP: TABLA COMPLETA */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-950/30 text-[8px] font-bold text-slate-450 uppercase tracking-widest border-b border-slate-850">
                    <th className="py-3 px-3 text-center w-[50px]">Status</th>
                    <th className="py-3 px-2 text-center w-[45px]">Esc/Pl</th>
                    <th className="py-3 px-3 text-center w-[65px]">Plan</th>
                    <th className="py-3 px-3 text-center w-[75px] bg-amber-950/10 text-amber-400">Estimada</th>
                    <th className="py-3 px-4">Descripción y Notas</th>
                    <th className="py-3 px-3 text-center w-[112px]">Referencias</th>
                  </tr>
                </thead>
                <tbody>
                  {pdrRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center italic text-sm text-slate-500">
                        No hay planos cargados para este día.
                      </td>
                    </tr>
                  ) : (
                    pdrRows.map((row, index) => {
                      const planTimes = rawPlanTimings[index] || { plannedStartStr: "08:00", plannedEndStr: "08:15" };
                      const estTimes = wrapEstTimings[index] || { estimadaStartStr: "08:00", estimadaEndStr: "08:15", originalEstimadaStart: "08:00" };
                      const firstPhoto = row.shotlist?.referencia_urls && row.shotlist.referencia_urls.trim().length > 6
                        ? row.shotlist.referencia_urls.split(",")[0].trim()
                        : null;

                      const isSpecialRow = row.shotlist?.plano?.toUpperCase() === "ES";

                      return (
                        <tr
                          key={row.id}
                          className={`group align-middle hover:bg-slate-950/60 border-b border-indigo-950/20 transition duration-150 select-none ${
                            row.terminado ? "bg-slate-950/40 opacity-50" : ""
                          } ${
                            isSpecialRow ? "bg-[#18142d] hover:bg-[#201b3d] border-b border-indigo-900/30" : ""
                          }`}
                        >

                          {/* finished button column (solid read-only icon) */}
                          <td className="py-3 px-3 text-center w-[50px]">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition mx-auto border ${
                                row.terminado
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-500/60 shadow-lg"
                                  : "bg-slate-950/20 text-slate-800 border-slate-900/40 opacity-30 cursor-not-allowed"
                              }`}
                              title={row.terminado ? "Plano Terminado" : "Plano Pendiente"}
                            >
                              <CheckCircle className={`w-5 h-5 ${row.terminado ? "fill-emerald-400/20" : ""}`} />
                            </div>
                            {row.terminado && localCompletedTimes[row.id] && (() => {
                              const startMin = index === 0
                                ? baseLlamadoMinutes
                                : (pdrRows[index - 1]?.terminado && localCompletedTimes[pdrRows[index - 1].id])
                                  ? parseTimeToMinutes(localCompletedTimes[pdrRows[index - 1].id])
                                  : baseLlamadoMinutes; // fallback
                              const endMin = parseTimeToMinutes(localCompletedTimes[row.id]);
                              const durationReal = Math.max(0, endMin - startMin);
                              return (
                                <div className="mt-1 flex flex-col items-center">
                                  <span className="text-[10px] font-bold font-mono tracking-tighter text-emerald-400 block leading-none">
                                    {localCompletedTimes[row.id]}
                                  </span>
                                  <span className="text-[9px] font-black font-mono tracking-tight text-emerald-500/80 block mt-1 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">
                                    {durationReal} min
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          {isSpecialRow ? (
                            <td colSpan={5} className="py-4 px-6 text-center select-all">
                              <div className="font-extrabold text-sm text-slate-150 uppercase tracking-wider py-1 max-w-xl mx-auto drop-shadow-sm leading-relaxed">
                                {row.shotlist?.descripcion || "FILA ESPECIAL"}
                              </div>
                              {(row.shotlist?.notas || row.shotlist?.notes) && (
                                <div className="text-[10px] text-indigo-400 font-mono mt-1 font-medium italic">
                                  NOTAS: {row.shotlist.notas || row.shotlist.notes}
                                </div>
                              )}
                            </td>
                          ) : (
                            <>
                              {/* Esc / Plano (Static text values) */}
                              <td className="py-3 px-2 text-center w-[45px]">
                                <div className="flex flex-col gap-0.5 items-center">
                                  <span className="text-[9px] text-[#94a3b8] font-mono font-bold leading-none">ESC</span>
                                  <span className="text-[14px] font-bold font-mono text-slate-200">{row.shotlist?.esc || "-"}</span>
                                  <span className="text-[9px] text-[#94a3b8] font-mono font-bold leading-none mt-1">PL</span>
                                  <span className="text-[14px] font-bold font-mono text-indigo-400">{row.shotlist?.plano || "-"}</span>
                                </div>
                              </td>

                              {/* Planificado (identical to Swift start/end stacked layout) */}
                              <td className="py-3 px-3 text-center font-mono w-[65px]">
                                <div className="flex flex-col items-center justify-center gap-0.5">
                                  <span className="text-[14px] font-semibold text-slate-100">{planTimes.plannedStartStr}</span>
                                  <span className="text-[8px] text-slate-500 leading-none">&bull;</span>
                                  <span className="text-[14px] font-bold text-slate-400">{planTimes.plannedEndStr}</span>
                                </div>
                                {row.terminado && localCompletedTimes[row.id] && (() => {
                                  const lockedHour = localCompletedTimes[row.id];
                                  const originalStart = estTimes.originalEstimadaStart;
                                  const minutesTaken = lockedHour && originalStart
                                    ? parseTimeToMinutes(lockedHour) - parseTimeToMinutes(originalStart)
                                    : 0;
                                  return (
                                    <div className="text-[7px] text-slate-500 mt-1 leading-none text-center">
                                      Fin @ {lockedHour} ({minutesTaken}m)
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* Estimada (matching Swift "INICIA" design) */}
                              <td className="py-3 px-3 text-center font-mono bg-amber-950/5 text-amber-300 w-[75px]">
                                <span className="text-[10px] font-semibold text-amber-500/80 block leading-none mb-1">INICIA</span>
                                <div className="font-black text-[16px] text-amber-450 leading-tight">{estTimes.estimadaStartStr}</div>
                                <span className="text-[10px] text-slate-500 block mt-1">{estTimes.estimadaEndStr}</span>
                              </td>

                              {/* Description & notes (Static with Pencil modal toggles removed) */}
                              <td className="py-3 px-4 text-xs">
                                <div className="flex items-start gap-1">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-slate-200 font-medium text-sm leading-relaxed break-words">
                                      {row.shotlist?.descripcion || <span className="italic text-slate-600">Sin descripción</span>}
                                    </p>
                                    {row.shotlist?.notas ? (
                                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
                                        <span className="text-indigo-455 font-black tracking-wider shrink-0 uppercase text-[10px]">NOTAS:</span>
                                        <span className="text-slate-450 font-mono break-words">{row.shotlist.notas}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </td>

                              {/* References Column with widescreen 100x55 frame matching Swift style changes */}
                              <td className="py-3 px-3 text-center w-[112px]" onClick={(e) => { e.stopPropagation(); triggerLightboxOpen(row); }}>
                                {firstPhoto ? (
                                  <div className="relative group/photo inline-block cursor-zoom-in">
                                    <img
                                      src={firstPhoto}
                                      alt="Reference"
                                      className="w-[100px] h-[55px] object-cover rounded-lg border border-slate-700/80 group-hover/photo:border-emerald-400/80 transition"
                                    />
                                    <div className="absolute inset-0 bg-black/45 rounded-lg opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition">
                                      <Eye className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-600 select-none italic font-mono">-</span>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* VISTA MOBILE: PLAN DETALLADO EN TARJETAS APILADAS */}
            <div className="block md:hidden divide-y divide-slate-850">
              {pdrRows.length === 0 ? (
                <div className="py-16 text-center italic text-sm text-slate-500">
                  No hay planos cargados para este día.
                </div>
              ) : (
                pdrRows.map((row, index) => {
                  const planTimes = rawPlanTimings[index] || { plannedStartStr: "08:00", plannedEndStr: "08:15" };
                  const estTimes = wrapEstTimings[index] || { estimadaStartStr: "08:00", estimadaEndStr: "08:15", originalEstimadaStart: "08:00" };
                  const firstPhoto = row.shotlist?.referencia_urls && row.shotlist.referencia_urls.trim().length > 6
                    ? row.shotlist.referencia_urls.split(",")[0].trim()
                    : null;

                  const isSpecialRow = row.shotlist?.plano?.toUpperCase() === "ES";

                  if (isSpecialRow) {
                    return (
                      <div
                        key={row.id}
                        className={`p-4 bg-[#18142d] border-b border-slate-850 select-none ${
                          row.terminado ? "opacity-50" : ""
                        }`}
                      >
                        <div className="font-extrabold text-sm text-slate-150 uppercase tracking-wider text-center leading-relaxed">
                          {row.shotlist?.descripcion || "FILA ESPECIAL"}
                        </div>
                        {(row.shotlist?.notas || row.shotlist?.notes) && (
                          <div className="text-[10px] text-indigo-400 font-mono mt-1 font-medium italic text-center">
                            NOTAS: {row.shotlist.notas || row.shotlist.notes}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={row.id}
                      className={`p-4 transition duration-150 select-none flex flex-col gap-3 ${
                        row.terminado ? "bg-slate-950/20 opacity-60" : "bg-slate-900/10"
                      }`}
                    >
                      {/* Fila superior: Escena/Plano y Estado */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Escena & Plano Badges */}
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-950 text-[10px] font-bold font-mono px-2 py-1 rounded border border-slate-800 text-slate-400">
                            ESC <span className="text-slate-100 font-extrabold text-xs">{row.shotlist?.esc || "-"}</span>
                          </span>
                          <span className="bg-indigo-950/60 text-[10px] font-bold font-mono px-2 py-1 rounded border border-indigo-900/40 text-indigo-300">
                            PLANO <span className="text-indigo-400 font-extrabold text-xs">{row.shotlist?.plano || "-"}</span>
                          </span>
                        </div>

                        {/* Estado clickable o estático */}
                        <div>
                          {row.terminado ? (
                            <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                              <CheckCircle className="w-3.5 h-3.5 fill-emerald-400/10 shrink-0" />
                              <span>FIN @ {localCompletedTimes[row.id]}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse shrink-0"></span>
                              <span>PENDIENTE</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fila intermedia: Tiempos Plan vs Est */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/30 border border-slate-850/55 rounded-xl p-2.5 text-xs font-mono">
                        {/* Planificado */}
                        <div className="flex flex-col items-center justify-center border-r border-slate-850/60 py-0.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5 text-center">PLANIFICADO</span>
                          <div className="flex items-center gap-1 text-[13px] font-semibold text-slate-200">
                            <span>{planTimes.plannedStartStr}</span>
                            <span className="text-[10px] text-slate-500">&bull;</span>
                            <span className="text-slate-400">{planTimes.plannedEndStr}</span>
                          </div>
                        </div>

                        {/* Estimada (Inicia/Termina) */}
                        <div className="flex flex-col items-center justify-center py-0.5 text-amber-300 bg-amber-950/5 rounded-lg">
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider mb-0.5 text-center">ESTIMADO</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[14px] font-black text-amber-450">{estTimes.estimadaStartStr}</span>
                            <span className="text-[10px] text-amber-600/60">&bull;</span>
                            <span className="text-[11px] text-slate-500">{estTimes.estimadaEndStr}</span>
                          </div>
                        </div>
                      </div>

                      {/* Fila inferior: Descripción y Referencia */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 font-medium text-[13px] leading-relaxed break-words">
                            {row.shotlist?.descripcion || <span className="italic text-slate-600">Sin descripción</span>}
                          </p>
                          {row.shotlist?.notas ? (
                            <div className="flex items-start gap-1.5 mt-2 text-[11px]">
                              <span className="text-[#a5b4fc] font-black tracking-wider shrink-0 uppercase text-[9px] mt-0.5">NOTAS:</span>
                              <span className="text-slate-400 font-mono break-words leading-relaxed">{row.shotlist.notas}</span>
                            </div>
                          ) : null}

                          {row.terminado && localCompletedTimes[row.id] && (() => {
                            const startMin = index === 0
                              ? baseLlamadoMinutes
                              : (pdrRows[index - 1]?.terminado && localCompletedTimes[pdrRows[index - 1].id])
                                ? parseTimeToMinutes(localCompletedTimes[pdrRows[index - 1].id])
                                : baseLlamadoMinutes;
                            const endMin = parseTimeToMinutes(localCompletedTimes[row.id]);
                            const durationReal = Math.max(0, endMin - startMin);
                            return (
                              <div className="mt-2 text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                                <span className="font-bold">Duración real:</span>
                                <span className="bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/30">
                                  {durationReal} min
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Imagen de referencia como un cuadrado pequeño */}
                        {firstPhoto ? (
                          <div
                            className="shrink-0 relative cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); triggerLightboxOpen(row); }}
                          >
                            <img
                              src={firstPhoto}
                              alt="Ref"
                              className="w-14 h-14 object-cover rounded-lg border border-slate-800 hover:border-emerald-400 transition"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        ) : null}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-slate-950/20 px-4 py-3 border-t border-slate-850 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-[11px] text-slate-500 font-mono">
            <span>Total Tomas: {pdrRows.length}</span>
            <span className="text-slate-600 sm:border-l sm:border-slate-800 sm:pl-6">rodajeApp v1.0 (inthependiente)</span>
          </div>
        </div>
      </div>

      {/* 10. REFERENCE GALLERY SCREEN MODAL & SCROLL SLIDER */}
      {activeRefImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <button
            onClick={() => setActiveRefImage(null)}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full flex flex-col items-center">
            
            {/* Display active reference */}
            <div className="relative w-full max-h-[70vh] flex justify-center items-center overflow-hidden bg-slate-950 rounded-2xl border border-slate-800">
              <img
                src={activeRefImage}
                alt="Fullscreen reference view"
                className="max-h-full max-w-full object-contain"
              />

              {/* Navigation sliders inside lightbox */}
              <button
                onClick={handlePrevGalleryImage}
                className="absolute left-3 p-3 bg-slate-900/80 hover:bg-indigo-600 rounded-full text-white backdrop-blur-sm transition border border-slate-800"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextGalleryImage}
                className="absolute right-3 p-3 bg-slate-900/80 hover:bg-indigo-600 rounded-full text-white backdrop-blur-sm transition border border-slate-800"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Gallery captions details */}
            <div className="text-center mt-4 text-slate-300">
              <p className="text-sm font-bold font-mono tracking-wider text-emerald-400">
                REFERENCIA {galleryIndex + 1} DE {imageGallery.length}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
                {pdrRows.find((r) => r.shotlist?.referencia_urls?.includes(activeRefImage))?.shotlist?.descripcion || "Referencia visual del Plan de Rodaje"}
              </p>

              {/* Interactive thumbnail slider indicators */}
              <div className="flex justify-center gap-1.5 mt-3 overflow-x-auto max-w-lg p-1">
                {imageGallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setGalleryIndex(i);
                      setActiveRefImage(img);
                    }}
                    className={`w-10 h-10 rounded border-2 overflow-hidden transition-all shrink-0 ${
                      galleryIndex === i ? "border-emerald-400 scale-105" : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD SHOT DIALOG MODAL */}
      {showAddShotModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddShotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Añadir Plano al Plan de Rodaje</span>
            </h3>

            <form onSubmit={handleAddNewShot} className="space-y-4 text-xs">
              
              {/* SHOTLIST LIBRARIAN SELECTOR TRIGGER FIRST */}
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <label className="text-indigo-400 font-bold block mb-1.5 uppercase tracking-wide">
                  1. Selección de Biblioteca (Shotlist)
                </label>
                <select
                  value={selectedShotlistId || ""}
                  onChange={(e) => {
                    const idStr = e.target.value;
                    if (!idStr) {
                      setSelectedShotlistId(null);
                      setNewShotData({
                        esc: "12",
                        plano: "",
                        descripcion: "",
                        duracion_min: 15,
                        notas: "",
                        referencia_urls: ""
                      });
                    } else {
                      const idNum = parseInt(idStr, 10);
                      setSelectedShotlistId(idNum);
                      const found = shotlistLibrary.find(s => s.id === idNum);
                      if (found) {
                        setNewShotData({
                          esc: found.esc,
                          plano: found.plano,
                          descripcion: found.descripcion,
                          duracion_min: 15,
                          notas: found.notas || "",
                          referencia_urls: found.referencia_urls || ""
                        });
                      }
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-2 text-amber-400 font-bold focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- [Crear nueva toma personalizada] --</option>
                  {shotlistLibrary
                    .filter((s) => s.proyecto_id === proyecto?.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        Esc {s.esc} Pl {s.plano} - {s.descripcion.substring(0, 32)}...
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  Si dejas esta opción vacía, podrás llenar el formulario de abajo para crear y enlazar un nuevo plano.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">
                  {selectedShotlistId ? "2. Información del Plano Seleccionado (Solo Lectura)" : "2. Datos para Nueva Toma"}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1 uppercase">ESCENA</label>
                    <input
                      type="text"
                      required
                      disabled={selectedShotlistId !== null}
                      value={newShotData.esc}
                      onChange={(e) => setNewShotData({ ...newShotData, esc: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-white focus:border-indigo-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1 uppercase">PLANO</label>
                    <input
                      type="text"
                      required
                      disabled={selectedShotlistId !== null}
                      value={newShotData.plano}
                      placeholder="ej. A/1"
                      onChange={(e) => setNewShotData({ ...newShotData, plano: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-white focus:border-indigo-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-slate-400 font-bold block mb-1 uppercase">DURACIÓN EN RODAJE (MINUTOS)</label>
                  <input
                    type="number"
                    required
                    value={newShotData.duracion_min}
                    onChange={(e) => setNewShotData({ ...newShotData, duracion_min: parseInt(e.target.value, 10) || 15 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-white focus:border-indigo-500"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-slate-400 font-bold block mb-1 uppercase">DESCRIPCIÓN DE LA TOMA</label>
                  <textarea
                    required
                    rows={2}
                    disabled={selectedShotlistId !== null}
                    value={newShotData.descripcion}
                    placeholder="Detalle de luz, cámara o acciones..."
                    onChange={(e) => setNewShotData({ ...newShotData, descripcion: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-slate-400 font-bold block mb-1 uppercase">NOTAS DE CONTINUIDAD</label>
                  <input
                    type="text"
                    disabled={selectedShotlistId !== null}
                    value={newShotData.notas}
                    onChange={(e) => setNewShotData({ ...newShotData, notas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-white placeholder-slate-700 disabled:opacity-50"
                    placeholder="ej. Dron a baja altura"
                  />
                </div>

                <div className="mb-3">
                  <label className="text-slate-400 font-bold block mb-1 uppercase">URL DE IMAGEN DE REFERENCIA</label>
                  <input
                    type="text"
                    disabled={selectedShotlistId !== null}
                    value={newShotData.referencia_urls}
                    onChange={(e) => setNewShotData({ ...newShotData, referencia_urls: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-white font-mono placeholder-slate-700 text-[10px] disabled:opacity-50"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddShotModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition font-semibold"
                >
                  Enlazar y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SHOT DESCRIPTION & NOTES DIALOG MODAL */}
      {editingPdrRow && (
        <div id="edit-shot-modal" className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingPdrRow(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-400" />
              <span>Editar Plano - Esc {editingPdrRow.shotlist?.esc} Pl {editingPdrRow.shotlist?.plano}</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="mb-3">
                <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wide">DESCRIPCIÓN DE LA TOMA</label>
                <textarea
                  required
                  rows={4}
                  value={editDescription}
                  placeholder="Detalle de luz, cámara o acciones..."
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/35"
                />
              </div>

              <div className="mb-3">
                <label className="text-slate-400 font-bold block mb-1 uppercase tracking-wide">NOTAS DE CONTINUIDAD</label>
                <input
                  type="text"
                  value={editNotes}
                  placeholder="ej. Dron a baja altura"
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/35"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingPdrRow(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalEdits}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-semibold cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
