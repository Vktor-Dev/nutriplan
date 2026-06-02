import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  ShoppingCart,
  Sparkles,
  Plus,
  Coffee,
  UtensilsCrossed,
  Moon,
  Shuffle,
  ChefHat,
  Leaf,
  X,
  Clock,
  Flame,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// PERSISTENCIA — localStorage seguro
// Detecta si localStorage está disponible (falla con gracia en modo incógnito,
// Safari restrictivo o en el preview de Claude). En la PWA/APK real persiste.
// ---------------------------------------------------------------------------
const STORAGE_OK = (() => {
  try {
    const k = '__nutriplan_test__';
    window.localStorage.setItem(k, k);
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();

function loadPersisted(key, fallback) {
  if (!STORAGE_OK) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => loadPersisted(key, defaultValue));
  useEffect(() => {
    if (!STORAGE_OK) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* almacenamiento lleno o no disponible: ignorar */
    }
  }, [key, state]);
  return [state, setState];
}

// ---------------------------------------------------------------------------
// MOCK DATA - PLAN, LISTA, GENERADOR
// ---------------------------------------------------------------------------
const dietData = {
  planSemanal: {
    Lunes: {
      Desayuno: { hora: '08:00', platos: ['Café solo', 'Pera 280g', 'Nueces 25g'] },
      Comida: {
        hora: '14:00',
        platos: [
          'Pan integral de trigo 125g',
          'Ensalada de alubias con almendras',
          'Uva 260g',
        ],
      },
      Cena: {
        hora: '21:00',
        platos: [
          'Tosta integral de pollo con cebolla caramelizada y pistachos',
          'Plátano',
        ],
      },
    },
    Martes: {
      Desayuno: { hora: '08:00', platos: ['Té verde', 'Manzana 200g', 'Almendras 25g'] },
      Comida: {
        hora: '14:00',
        platos: [
          'Quinoa con pollo a la plancha 110g',
          'Ensalada de tomate y aguacate',
          'Naranja 200g',
        ],
      },
      Cena: { hora: '21:00', platos: ['Lenguado a la plancha con brócoli', 'Yogur natural'] },
    },
    Miércoles: {
      Desayuno: {
        hora: '08:00',
        platos: ['Café con leche desnatada', 'Tostada integral con tomate', 'Kiwi 150g'],
      },
      Comida: {
        hora: '14:00',
        platos: ['Lentejas estofadas con verduras 200g', 'Arroz integral 80g', 'Pera 200g'],
      },
      Cena: { hora: '21:00', platos: ['Tortilla francesa con espinacas', 'Ensalada verde'] },
    },
    Jueves: {
      Desayuno: {
        hora: '08:00',
        platos: ['Café solo', 'Yogur griego 0% con fresas', 'Avena 30g'],
      },
      Comida: {
        hora: '14:00',
        platos: ['Salmón al horno 150g', 'Patata asada 200g', 'Espárragos verdes'],
      },
      Cena: { hora: '21:00', platos: ['Sopa de verduras', 'Pechuga de pavo a la plancha 120g'] },
    },
    Viernes: {
      Desayuno: { hora: '08:00', platos: ['Café con leche', 'Plátano 180g', 'Pistachos 20g'] },
      Comida: {
        hora: '14:00',
        platos: ['Espirales integrales con atún y tomate', 'Ensalada mixta', 'Uva 250g'],
      },
      Cena: { hora: '21:00', platos: ['Huevos al nido en berenjena', 'Pan integral 40g'] },
    },
    Sábado: {
      Desayuno: {
        hora: '08:00',
        platos: ['Café solo', 'Tostadas integrales con aguacate', 'Mandarinas 180g'],
      },
      Comida: {
        hora: '14:00',
        platos: ['Garbanzos con espinacas 200g', 'Pan integral 80g', 'Manzana 200g'],
      },
      Cena: { hora: '21:00', platos: ['Merluza al vapor con verduras', 'Yogur natural'] },
    },
    Domingo: {
      Desayuno: { hora: '08:00', platos: ['Café con leche', 'Avena con plátano y nueces', 'Té verde'] },
      Comida: {
        hora: '14:00',
        platos: [
          'Paella de verduras y pollo 150g',
          'Ensalada de canónigos',
          'Sandía 250g',
        ],
      },
      Cena: { hora: '21:00', platos: ['Crema de calabaza', 'Pavo a la plancha con pimientos'] },
    },
  },

  listaCompra: {
    Frutas: [
      { id: 1, nombre: 'Pera', cantidad: '1400 g', comprado: false },
      { id: 2, nombre: 'Uva blanca', cantidad: '1300 g', comprado: false },
      { id: 3, nombre: 'Plátano, banano', cantidad: '1125 g', comprado: true },
      { id: 11, nombre: 'Manzana', cantidad: '600 g', comprado: false },
      { id: 12, nombre: 'Naranja', cantidad: '400 g', comprado: false },
    ],
    'Patatas, legumbres y frutos secos': [
      { id: 4, nombre: 'Nuez pelada', cantidad: '95 g', comprado: false },
      { id: 5, nombre: 'Alubias cocidas', cantidad: '275 g', comprado: false },
      { id: 13, nombre: 'Almendra cruda', cantidad: '80 g', comprado: true },
      { id: 14, nombre: 'Lentejas pardinas', cantidad: '200 g', comprado: false },
    ],
    'Cereales, azúcares y derivados': [
      { id: 6, nombre: 'Pan integral de trigo', cantidad: '1000 g', comprado: false },
      { id: 15, nombre: 'Quinoa', cantidad: '110 g', comprado: false },
      { id: 16, nombre: 'Arroz integral', cantidad: '80 g', comprado: false },
    ],
    'Carnes, pescados y huevos': [
      { id: 7, nombre: 'Pechuga de pollo', cantidad: '260 g', comprado: false },
      { id: 8, nombre: 'Lenguado', cantidad: '450 g', comprado: false },
      { id: 9, nombre: 'Huevos', cantidad: '4 uds', comprado: false },
      { id: 10, nombre: 'Salmón', cantidad: '150 g', comprado: false },
    ],
  },

  porPlato: {
    'Ensalada de alubias con almendras': [
      { id: 'a1', nombre: 'Alubias cocidas', cantidad: '275 g', comprado: false },
      { id: 'a2', nombre: 'Almendra cruda', cantidad: '20 g', comprado: false },
      { id: 'a3', nombre: 'Tomate cherry', cantidad: '100 g', comprado: false },
      { id: 'a4', nombre: 'AOVE', cantidad: '10 g', comprado: true },
    ],
    'Tosta integral de pollo con pistachos': [
      { id: 'b1', nombre: 'Pan integral', cantidad: '60 g', comprado: false },
      { id: 'b2', nombre: 'Pechuga de pollo', cantidad: '100 g', comprado: false },
      { id: 'b3', nombre: 'Cebolla', cantidad: '50 g', comprado: false },
      { id: 'b4', nombre: 'Pistachos', cantidad: '15 g', comprado: false },
    ],
    'Quinoa con pollo a la plancha': [
      { id: 'c1', nombre: 'Quinoa', cantidad: '110 g', comprado: false },
      { id: 'c2', nombre: 'Pechuga de pollo', cantidad: '120 g', comprado: false },
      { id: 'c3', nombre: 'Tomate', cantidad: '150 g', comprado: false },
    ],
    'Lenguado a la plancha con brócoli': [
      { id: 'd1', nombre: 'Lenguado', cantidad: '450 g', comprado: false },
      { id: 'd2', nombre: 'Brócoli', cantidad: '175 g', comprado: false },
      { id: 'd3', nombre: 'AOVE', cantidad: '10 g', comprado: false },
    ],
  },

  generador: {
    comidas: [
      {
        titulo: 'Quinoa con pollo',
        macros: { kcal: 520, p: 42, c: 55, g: 14 },
        ingredientes: ['110g Quinoa', '120g Pechuga de pollo', '150g Tomate', '10g AOVE'],
      },
      {
        titulo: 'Lenguado a la plancha con brócoli',
        macros: { kcal: 480, p: 48, c: 18, g: 22 },
        ingredientes: ['450g Lenguado', '175g Brócoli', '10g AOVE'],
      },
      {
        titulo: 'Lentejas con verduras y pavo',
        macros: { kcal: 540, p: 40, c: 60, g: 12 },
        ingredientes: [
          '80g Lentejas pardinas',
          '100g Pavo',
          'Zanahoria',
          'Cebolla',
          '10g AOVE',
        ],
      },
      {
        titulo: 'Arroz integral con salmón y espinacas',
        macros: { kcal: 560, p: 38, c: 50, g: 20 },
        ingredientes: ['70g Arroz integral', '130g Salmón', '100g Espinacas', '10g AOVE'],
      },
    ],
    cenas: [
      {
        titulo: 'Huevos al nido en berenjena',
        macros: { kcal: 380, p: 26, c: 22, g: 20 },
        ingredientes: ['1 Berenjena', '2 Huevos', 'Tomate triturado', 'Cebolla'],
      },
      {
        titulo: 'Ensalada de espirales con pollo',
        macros: { kcal: 460, p: 36, c: 48, g: 14 },
        ingredientes: ['90g Espirales', '140g Pollo', 'Tomate cherry', 'Nueces'],
      },
      {
        titulo: 'Tortilla francesa con espárragos',
        macros: { kcal: 320, p: 24, c: 8, g: 22 },
        ingredientes: ['3 Huevos', '150g Espárragos verdes', '5g AOVE'],
      },
      {
        titulo: 'Crema de calabacín y pavo',
        macros: { kcal: 360, p: 32, c: 18, g: 16 },
        ingredientes: ['200g Calabacín', '120g Pavo a la plancha', 'Cebolla', '5g AOVE'],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// RECETAS DETALLADAS (ingredientes con gramajes + preparación)
// Cada key es una palabra clave que se busca en el nombre del plato.
// ---------------------------------------------------------------------------
const recetas = {
  // ---- BEBIDAS / SIMPLES ----
  'café solo': {
    tiempo: '3 min',
    dificultad: 'Fácil',
    macros: { kcal: 5, p: 0, c: 1, g: 0 },
    ingredientes: [
      { nombre: 'Café molido', cantidad: '8 g' },
      { nombre: 'Agua', cantidad: '60 ml' },
    ],
    pasos: [
      'Calienta el agua a 92-96°C.',
      'Prepara el café en cafetera, espresso o filtro a tu gusto.',
      'Sirve y disfruta sin azúcar para mantener el déficit calórico.',
    ],
  },
  'café con leche desnatada': {
    tiempo: '4 min',
    dificultad: 'Fácil',
    macros: { kcal: 50, p: 5, c: 7, g: 0 },
    ingredientes: [
      { nombre: 'Café molido', cantidad: '8 g' },
      { nombre: 'Leche desnatada', cantidad: '150 ml' },
    ],
    pasos: [
      'Prepara un espresso o café americano.',
      'Calienta y espuma la leche desnatada.',
      'Mezcla y consume sin azúcar.',
    ],
  },
  'café con leche': {
    tiempo: '4 min',
    dificultad: 'Fácil',
    macros: { kcal: 70, p: 5, c: 7, g: 2 },
    ingredientes: [
      { nombre: 'Café molido', cantidad: '8 g' },
      { nombre: 'Leche semidesnatada', cantidad: '150 ml' },
    ],
    pasos: ['Prepara el café.', 'Calienta la leche.', 'Mezcla y sirve.'],
  },
  'té verde': {
    tiempo: '5 min',
    dificultad: 'Fácil',
    macros: { kcal: 2, p: 0, c: 0, g: 0 },
    ingredientes: [
      { nombre: 'Té verde en hoja', cantidad: '2 g' },
      { nombre: 'Agua', cantidad: '250 ml' },
    ],
    pasos: [
      'Calienta el agua a 75-80°C (no debe hervir).',
      'Infusiona 2-3 minutos según intensidad deseada.',
      'Retira las hojas y bebe sin endulzar.',
    ],
  },

  // ---- FRUTAS ----
  pera: {
    tiempo: '1 min',
    dificultad: 'Fácil',
    macros: { kcal: 165, p: 1, c: 42, g: 0 },
    ingredientes: [{ nombre: 'Pera', cantidad: '280 g' }],
    pasos: [
      'Lava bien la pera bajo el grifo.',
      'Consume con piel para aprovechar la fibra.',
    ],
  },
  uva: {
    tiempo: '2 min',
    dificultad: 'Fácil',
    macros: { kcal: 180, p: 2, c: 47, g: 0 },
    ingredientes: [{ nombre: 'Uva blanca', cantidad: '260 g' }],
    pasos: ['Lava bien el racimo.', 'Desgrana y consume.'],
  },
  plátano: {
    tiempo: '1 min',
    dificultad: 'Fácil',
    macros: { kcal: 165, p: 2, c: 42, g: 0 },
    ingredientes: [{ nombre: 'Plátano', cantidad: '1 unidad mediana' }],
    pasos: ['Pela y consume.'],
  },
  manzana: {
    tiempo: '1 min',
    dificultad: 'Fácil',
    macros: { kcal: 105, p: 0, c: 28, g: 0 },
    ingredientes: [{ nombre: 'Manzana', cantidad: '200 g' }],
    pasos: ['Lava bien y consume con piel.'],
  },
  naranja: {
    tiempo: '2 min',
    dificultad: 'Fácil',
    macros: { kcal: 95, p: 2, c: 24, g: 0 },
    ingredientes: [{ nombre: 'Naranja', cantidad: '200 g' }],
    pasos: ['Pela la naranja y consume en gajos.'],
  },
  kiwi: {
    tiempo: '2 min',
    dificultad: 'Fácil',
    macros: { kcal: 90, p: 2, c: 22, g: 1 },
    ingredientes: [{ nombre: 'Kiwi', cantidad: '150 g (2 uds)' }],
    pasos: ['Pela y corta en rodajas, o parte por la mitad y come con cuchara.'],
  },
  mandarina: {
    tiempo: '2 min',
    dificultad: 'Fácil',
    macros: { kcal: 80, p: 1, c: 20, g: 0 },
    ingredientes: [{ nombre: 'Mandarinas', cantidad: '180 g' }],
    pasos: ['Pela y separa los gajos.'],
  },
  sandía: {
    tiempo: '3 min',
    dificultad: 'Fácil',
    macros: { kcal: 75, p: 2, c: 19, g: 0 },
    ingredientes: [{ nombre: 'Sandía', cantidad: '250 g' }],
    pasos: ['Corta en cubos retirando la corteza.', 'Sirve frío.'],
  },

  // ---- FRUTOS SECOS ----
  nueces: {
    tiempo: '1 min',
    dificultad: 'Fácil',
    macros: { kcal: 165, p: 4, c: 3, g: 16 },
    ingredientes: [{ nombre: 'Nueces peladas', cantidad: '25 g' }],
    pasos: [
      'Pesa la ración en báscula para no excederte.',
      'Consume al natural, sin sal añadida.',
    ],
  },
  almendras: {
    tiempo: '1 min',
    dificultad: 'Fácil',
    macros: { kcal: 145, p: 5, c: 5, g: 13 },
    ingredientes: [{ nombre: 'Almendras crudas', cantidad: '25 g' }],
    pasos: ['Pesa la ración y consume al natural sin sal.'],
  },
  pistachos: {
    tiempo: '1 min',
    dificultad: 'Fácil',
    macros: { kcal: 115, p: 4, c: 5, g: 9 },
    ingredientes: [{ nombre: 'Pistachos sin sal', cantidad: '20 g' }],
    pasos: ['Pesa la ración con cáscara aparte.', 'Consume sin sal añadida.'],
  },

  // ---- PANES Y CEREALES ----
  'pan integral': {
    tiempo: '2 min',
    dificultad: 'Fácil',
    macros: { kcal: 290, p: 12, c: 55, g: 3 },
    ingredientes: [
      { nombre: 'Pan integral de trigo', cantidad: '125 g' },
    ],
    pasos: [
      'Corta en rebanadas si no está fileteado.',
      'Tuesta ligeramente si lo prefieres.',
    ],
  },
  'tostada integral con tomate': {
    tiempo: '6 min',
    dificultad: 'Fácil',
    macros: { kcal: 200, p: 6, c: 32, g: 5 },
    ingredientes: [
      { nombre: 'Pan integral', cantidad: '60 g' },
      { nombre: 'Tomate maduro rallado', cantidad: '80 g' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Sal', cantidad: 'al gusto' },
    ],
    pasos: [
      'Tuesta el pan integral hasta dorarlo.',
      'Ralla el tomate descartando la piel.',
      'Cubre el pan con el tomate, añade un hilo de AOVE y una pizca de sal.',
    ],
  },
  'tostadas integrales con aguacate': {
    tiempo: '7 min',
    dificultad: 'Fácil',
    macros: { kcal: 320, p: 8, c: 34, g: 16 },
    ingredientes: [
      { nombre: 'Pan integral', cantidad: '80 g' },
      { nombre: 'Aguacate', cantidad: '80 g (½ unidad)' },
      { nombre: 'Zumo de limón', cantidad: '5 ml' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Tuesta el pan.',
      'Aplasta el aguacate con un tenedor y mezcla con el limón.',
      'Extiende sobre la tostada, salpimenta al gusto.',
    ],
  },
  avena: {
    tiempo: '3 min',
    dificultad: 'Fácil',
    macros: { kcal: 110, p: 4, c: 19, g: 2 },
    ingredientes: [{ nombre: 'Copos de avena', cantidad: '30 g' }],
    pasos: [
      'Mezcla con leche, yogur o agua caliente.',
      'Deja reposar 2 minutos para que se hidrate.',
    ],
  },
  'avena con plátano y nueces': {
    tiempo: '7 min',
    dificultad: 'Fácil',
    macros: { kcal: 360, p: 10, c: 52, g: 13 },
    ingredientes: [
      { nombre: 'Copos de avena', cantidad: '50 g' },
      { nombre: 'Leche semidesnatada', cantidad: '200 ml' },
      { nombre: 'Plátano', cantidad: '100 g' },
      { nombre: 'Nueces peladas', cantidad: '15 g' },
      { nombre: 'Canela', cantidad: 'al gusto' },
    ],
    pasos: [
      'Calienta la leche y mezcla la avena. Cocina 3 min a fuego medio.',
      'Trocea el plátano y añádelo por encima.',
      'Espolvorea las nueces partidas y la canela.',
    ],
  },

  // ---- LÁCTEOS ----
  'yogur griego': {
    tiempo: '3 min',
    dificultad: 'Fácil',
    macros: { kcal: 130, p: 18, c: 10, g: 0 },
    ingredientes: [
      { nombre: 'Yogur griego 0%', cantidad: '150 g' },
      { nombre: 'Fresas', cantidad: '80 g' },
    ],
    pasos: [
      'Lava y trocea las fresas.',
      'Añade al yogur y mezcla.',
    ],
  },
  'yogur natural': {
    tiempo: '1 min',
    dificultad: 'Fácil',
    macros: { kcal: 60, p: 5, c: 7, g: 1 },
    ingredientes: [{ nombre: 'Yogur natural sin azúcar', cantidad: '125 g' }],
    pasos: ['Consume tal cual, sin añadir azúcar.'],
  },

  // ---- ENSALADAS Y PLATOS PRINCIPALES ----
  'ensalada de alubias con almendras': {
    tiempo: '12 min',
    dificultad: 'Fácil',
    macros: { kcal: 380, p: 18, c: 35, g: 18 },
    ingredientes: [
      { nombre: 'Alubias blancas cocidas', cantidad: '180 g' },
      { nombre: 'Almendras laminadas', cantidad: '20 g' },
      { nombre: 'Tomate cherry', cantidad: '100 g' },
      { nombre: 'Cebolla morada', cantidad: '30 g' },
      { nombre: 'Hojas de espinaca baby', cantidad: '40 g' },
      { nombre: 'AOVE', cantidad: '10 g' },
      { nombre: 'Vinagre de Jerez', cantidad: '5 ml' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Escurre y enjuaga las alubias en cocidas para eliminar excesos de sal.',
      'Trocea los tomates cherry por la mitad y pica fina la cebolla.',
      'En un bol, mezcla las espinacas, alubias, tomate y cebolla.',
      'Tuesta las almendras 1-2 min en una sartén sin aceite hasta dorarlas.',
      'Aliña con AOVE, vinagre, sal y pimienta. Añade las almendras por encima.',
    ],
  },
  'tosta integral de pollo': {
    tiempo: '20 min',
    dificultad: 'Media',
    macros: { kcal: 420, p: 32, c: 38, g: 14 },
    ingredientes: [
      { nombre: 'Pan integral', cantidad: '60 g' },
      { nombre: 'Pechuga de pollo', cantidad: '100 g' },
      { nombre: 'Cebolla', cantidad: '80 g' },
      { nombre: 'Pistachos pelados', cantidad: '10 g' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Vinagre balsámico', cantidad: '5 ml' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Corta la cebolla en juliana fina y póchala 10-12 min en sartén con 3 g de AOVE a fuego bajo hasta caramelizarse. Al final, añade el balsámico y reduce 1 min.',
      'Salpimenta la pechuga y márcala a la plancha 3-4 min por lado con 2 g de AOVE. Deja reposar 2 min y filetea.',
      'Tuesta el pan integral.',
      'Monta la tosta: pan, cebolla caramelizada, pollo fileteado y los pistachos picados por encima.',
    ],
  },
  'quinoa con pollo': {
    tiempo: '25 min',
    dificultad: 'Media',
    macros: { kcal: 520, p: 42, c: 55, g: 14 },
    ingredientes: [
      { nombre: 'Quinoa', cantidad: '110 g (en seco)' },
      { nombre: 'Agua o caldo de verduras', cantidad: '220 ml' },
      { nombre: 'Pechuga de pollo', cantidad: '120 g' },
      { nombre: 'Tomate', cantidad: '150 g' },
      { nombre: 'AOVE', cantidad: '10 g' },
      { nombre: 'Comino, sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Enjuaga la quinoa bajo el grifo unos segundos para retirar la saponina.',
      'Cocínala con el doble de agua o caldo, tapada, 15 min a fuego medio-bajo. Deja reposar 5 min más.',
      'Mientras, corta la pechuga en dados y márcala a la plancha con 5 g de AOVE, salpimentada, hasta dorar (6-7 min).',
      'Trocea el tomate en concassé (sin piel ni pepitas, en cubos pequeños).',
      'Mezcla la quinoa con el pollo y el tomate, aliña con el resto de AOVE y una pizca de comino.',
    ],
  },
  'ensalada de tomate y aguacate': {
    tiempo: '8 min',
    dificultad: 'Fácil',
    macros: { kcal: 220, p: 3, c: 14, g: 17 },
    ingredientes: [
      { nombre: 'Tomate rama maduro', cantidad: '200 g' },
      { nombre: 'Aguacate', cantidad: '80 g' },
      { nombre: 'Cebolla morada', cantidad: '20 g' },
      { nombre: 'Hojas de albahaca', cantidad: '4-5 hojas' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Corta el tomate en rodajas y el aguacate en gajos.',
      'Pica fina la cebolla morada.',
      'Coloca en plato, salpimenta y rocía con AOVE.',
      'Termina con albahaca fresca picada.',
    ],
  },
  'lenguado a la plancha con brócoli': {
    tiempo: '15 min',
    dificultad: 'Fácil',
    macros: { kcal: 380, p: 42, c: 12, g: 18 },
    ingredientes: [
      { nombre: 'Filetes de lenguado', cantidad: '200 g' },
      { nombre: 'Brócoli', cantidad: '175 g' },
      { nombre: 'AOVE', cantidad: '10 g' },
      { nombre: 'Ajo', cantidad: '1 diente' },
      { nombre: 'Limón', cantidad: '½ unidad' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Separa el brócoli en ramilletes y cuécelos al vapor 6-7 min hasta que estén tiernos pero firmes.',
      'Calienta una sartén con 5 g de AOVE y el ajo laminado. Salpimenta los filetes de lenguado.',
      'Marca el pescado 1-2 min por cada lado a fuego alto.',
      'Aliña el brócoli con el resto de AOVE y un chorrito de limón.',
      'Sirve el lenguado con el brócoli al lado y zumo de limón por encima.',
    ],
  },
  'lentejas estofadas con verduras': {
    tiempo: '40 min',
    dificultad: 'Media',
    macros: { kcal: 350, p: 20, c: 50, g: 8 },
    ingredientes: [
      { nombre: 'Lentejas pardinas', cantidad: '80 g (en seco)' },
      { nombre: 'Zanahoria', cantidad: '60 g' },
      { nombre: 'Cebolla', cantidad: '60 g' },
      { nombre: 'Pimiento rojo', cantidad: '50 g' },
      { nombre: 'Tomate triturado', cantidad: '80 g' },
      { nombre: 'Ajo', cantidad: '2 dientes' },
      { nombre: 'AOVE', cantidad: '8 g' },
      { nombre: 'Laurel, pimentón y comino', cantidad: 'al gusto' },
    ],
    pasos: [
      'Pica todas las verduras en brunoise (dados pequeños).',
      'Pocha en una cazuela con AOVE el ajo, cebolla, pimiento y zanahoria durante 10 min.',
      'Añade el pimentón (sin que se queme), el tomate triturado y cocina 3 min más.',
      'Incorpora las lentejas, laurel, comino y cubre con agua 3 dedos por encima.',
      'Cuece a fuego medio-bajo 25-30 min hasta que estén tiernas. Rectifica de sal.',
    ],
  },
  'arroz integral': {
    tiempo: '35 min',
    dificultad: 'Fácil',
    macros: { kcal: 280, p: 6, c: 58, g: 2 },
    ingredientes: [
      { nombre: 'Arroz integral', cantidad: '80 g' },
      { nombre: 'Agua', cantidad: '200 ml' },
      { nombre: 'Sal', cantidad: '1 pizca' },
    ],
    pasos: [
      'Enjuaga el arroz bajo el grifo.',
      'Cuece en agua hirviendo con sal durante 25-30 min a fuego medio-bajo, tapado.',
      'Deja reposar 5 min más antes de servir.',
    ],
  },
  'tortilla francesa con espinacas': {
    tiempo: '8 min',
    dificultad: 'Fácil',
    macros: { kcal: 230, p: 18, c: 4, g: 16 },
    ingredientes: [
      { nombre: 'Huevos', cantidad: '2 unidades' },
      { nombre: 'Espinacas frescas', cantidad: '80 g' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Ajo', cantidad: '1 diente' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Saltea el ajo laminado en una sartén con AOVE.',
      'Añade las espinacas y rehoga 2 min hasta que reduzcan volumen.',
      'Bate los huevos con sal y pimienta. Incorpora las espinacas a los huevos.',
      'Vierte la mezcla en la sartén caliente y cuaja a tu gusto, plegando la tortilla.',
    ],
  },
  'ensalada verde': {
    tiempo: '5 min',
    dificultad: 'Fácil',
    macros: { kcal: 90, p: 2, c: 6, g: 6 },
    ingredientes: [
      { nombre: 'Mezclum de hojas verdes', cantidad: '80 g' },
      { nombre: 'Pepino', cantidad: '50 g' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Vinagre y sal', cantidad: 'al gusto' },
    ],
    pasos: [
      'Lava bien las hojas y centrifúgalas o sécalas con papel.',
      'Pela y corta el pepino en rodajas.',
      'Aliña con AOVE, vinagre y sal.',
    ],
  },
  'salmón al horno': {
    tiempo: '20 min',
    dificultad: 'Fácil',
    macros: { kcal: 320, p: 32, c: 0, g: 22 },
    ingredientes: [
      { nombre: 'Lomo de salmón', cantidad: '150 g' },
      { nombre: 'Limón', cantidad: '½ unidad' },
      { nombre: 'Eneldo o perejil', cantidad: 'al gusto' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Precalienta el horno a 200°C.',
      'Coloca el salmón sobre papel vegetal, salpimenta y rocía con AOVE.',
      'Añade rodajas de limón encima y espolvorea eneldo.',
      'Hornea 12-15 min hasta que la carne se desmenuce fácilmente.',
    ],
  },
  'patata asada': {
    tiempo: '40 min',
    dificultad: 'Fácil',
    macros: { kcal: 175, p: 4, c: 40, g: 0 },
    ingredientes: [
      { nombre: 'Patata', cantidad: '200 g' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
      { nombre: 'Romero o tomillo', cantidad: 'al gusto' },
    ],
    pasos: [
      'Lava bien la patata y pínchala con un tenedor varias veces.',
      'Envuélvela en papel de aluminio o ponla directamente en bandeja.',
      'Hornea a 200°C durante 35-40 min hasta que esté tierna al pinchar.',
      'Abre por la mitad, salpimenta y añade hierbas aromáticas.',
    ],
  },
  'espárragos verdes': {
    tiempo: '8 min',
    dificultad: 'Fácil',
    macros: { kcal: 50, p: 4, c: 5, g: 2 },
    ingredientes: [
      { nombre: 'Espárragos verdes', cantidad: '150 g' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Ajo', cantidad: '1 diente' },
      { nombre: 'Sal en escamas', cantidad: 'al gusto' },
    ],
    pasos: [
      'Retira la parte leñosa de los espárragos (los últimos 2-3 cm).',
      'Saltea en sartén con AOVE y ajo laminado 5-6 min hasta dorar.',
      'Termina con sal en escamas.',
    ],
  },
  'sopa de verduras': {
    tiempo: '30 min',
    dificultad: 'Fácil',
    macros: { kcal: 120, p: 4, c: 18, g: 4 },
    ingredientes: [
      { nombre: 'Puerro', cantidad: '80 g' },
      { nombre: 'Zanahoria', cantidad: '80 g' },
      { nombre: 'Apio', cantidad: '40 g' },
      { nombre: 'Calabacín', cantidad: '100 g' },
      { nombre: 'Caldo de verduras', cantidad: '400 ml' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Pica todas las verduras en dados pequeños.',
      'Pocha en una cazuela con AOVE 5 min.',
      'Añade el caldo y cuece 20-25 min hasta que las verduras estén tiernas.',
      'Rectifica de sal y pimienta antes de servir.',
    ],
  },
  'pechuga de pavo a la plancha': {
    tiempo: '10 min',
    dificultad: 'Fácil',
    macros: { kcal: 160, p: 28, c: 0, g: 5 },
    ingredientes: [
      { nombre: 'Pechuga de pavo en filetes', cantidad: '120 g' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Ajo en polvo, sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Salpimenta los filetes y espolvorea ajo en polvo.',
      'Calienta la plancha con AOVE.',
      'Cocina 2-3 min por cada lado hasta que estén dorados.',
    ],
  },
  'espirales integrales con atún y tomate': {
    tiempo: '15 min',
    dificultad: 'Fácil',
    macros: { kcal: 480, p: 30, c: 60, g: 12 },
    ingredientes: [
      { nombre: 'Espirales integrales', cantidad: '90 g (en seco)' },
      { nombre: 'Atún al natural', cantidad: '80 g (escurrido)' },
      { nombre: 'Tomate cherry', cantidad: '120 g' },
      { nombre: 'Cebolla morada', cantidad: '30 g' },
      { nombre: 'Aceitunas negras', cantidad: '20 g' },
      { nombre: 'AOVE', cantidad: '8 g' },
      { nombre: 'Albahaca, sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Cuece la pasta en agua hirviendo con sal el tiempo indicado en el paquete (al dente).',
      'Mientras, corta los cherry por la mitad y pica fina la cebolla.',
      'Escurre la pasta y pásala por agua fría para cortar la cocción.',
      'Mezcla con el atún, tomate, cebolla, aceitunas y aliña con AOVE.',
      'Termina con albahaca fresca picada.',
    ],
  },
  'ensalada mixta': {
    tiempo: '6 min',
    dificultad: 'Fácil',
    macros: { kcal: 110, p: 3, c: 10, g: 7 },
    ingredientes: [
      { nombre: 'Lechuga', cantidad: '60 g' },
      { nombre: 'Tomate', cantidad: '80 g' },
      { nombre: 'Cebolla', cantidad: '20 g' },
      { nombre: 'Zanahoria rallada', cantidad: '30 g' },
      { nombre: 'Aceitunas verdes', cantidad: '15 g' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Vinagre y sal', cantidad: 'al gusto' },
    ],
    pasos: [
      'Lava la lechuga y trocéala a mano.',
      'Corta el tomate, cebolla y añade la zanahoria rallada.',
      'Aliña con AOVE, vinagre y sal.',
    ],
  },
  'huevos al nido en berenjena': {
    tiempo: '40 min',
    dificultad: 'Media',
    macros: { kcal: 380, p: 26, c: 22, g: 20 },
    ingredientes: [
      { nombre: 'Berenjena', cantidad: '1 unidad mediana (250 g)' },
      { nombre: 'Huevos', cantidad: '2 unidades' },
      { nombre: 'Tomate triturado', cantidad: '100 g' },
      { nombre: 'Cebolla', cantidad: '60 g' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Orégano, sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Precalienta el horno a 200°C.',
      'Corta la berenjena por la mitad longitudinalmente y vacía el centro con una cuchara dejando 1 cm de carne.',
      'Pica la pulpa de berenjena y sofríela con la cebolla en una sartén con AOVE 5 min.',
      'Añade el tomate triturado y cocina 5 min más. Salpimenta.',
      'Rellena las mitades de berenjena con el sofrito, haz un hueco en el centro y casca un huevo en cada una.',
      'Hornea 18-20 min hasta que la clara cuaje. Espolvorea orégano antes de servir.',
    ],
  },
  'garbanzos con espinacas': {
    tiempo: '25 min',
    dificultad: 'Fácil',
    macros: { kcal: 380, p: 18, c: 45, g: 12 },
    ingredientes: [
      { nombre: 'Garbanzos cocidos', cantidad: '200 g' },
      { nombre: 'Espinacas frescas', cantidad: '150 g' },
      { nombre: 'Ajo', cantidad: '2 dientes' },
      { nombre: 'Tomate triturado', cantidad: '50 g' },
      { nombre: 'Pimentón dulce', cantidad: '1 cdta' },
      { nombre: 'Comino', cantidad: '1 pizca' },
      { nombre: 'AOVE', cantidad: '8 g' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Enjuaga los garbanzos y resérvalos.',
      'En una sartén con AOVE, dora el ajo picado. Añade el pimentón fuera del fuego para que no se queme.',
      'Incorpora el tomate triturado, cocina 5 min.',
      'Añade los garbanzos y un chorrito de agua. Cuece 5 min más.',
      'Incorpora las espinacas y remueve hasta que reduzcan. Termina con comino y rectifica de sal.',
    ],
  },
  'merluza al vapor con verduras': {
    tiempo: '20 min',
    dificultad: 'Fácil',
    macros: { kcal: 260, p: 34, c: 8, g: 8 },
    ingredientes: [
      { nombre: 'Lomo de merluza', cantidad: '180 g' },
      { nombre: 'Zanahoria en bastones', cantidad: '60 g' },
      { nombre: 'Calabacín en rodajas', cantidad: '80 g' },
      { nombre: 'Puerro', cantidad: '40 g' },
      { nombre: 'Limón', cantidad: '½ unidad' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Coloca las verduras en la base de la vaporera 5 min.',
      'Añade encima la merluza salpimentada con unas rodajas de limón.',
      'Cocina al vapor 8-10 min hasta que el pescado se desmenuce.',
      'Sirve con un hilo de AOVE en crudo.',
    ],
  },
  'paella de verduras y pollo': {
    tiempo: '45 min',
    dificultad: 'Media',
    macros: { kcal: 480, p: 28, c: 55, g: 14 },
    ingredientes: [
      { nombre: 'Arroz redondo bomba', cantidad: '100 g' },
      { nombre: 'Pechuga de pollo en dados', cantidad: '120 g' },
      { nombre: 'Judía verde', cantidad: '60 g' },
      { nombre: 'Pimiento rojo', cantidad: '50 g' },
      { nombre: 'Tomate rallado', cantidad: '60 g' },
      { nombre: 'Caldo de verduras', cantidad: '300 ml' },
      { nombre: 'AOVE', cantidad: '8 g' },
      { nombre: 'Azafrán o colorante, pimentón, sal', cantidad: 'al gusto' },
    ],
    pasos: [
      'Dora el pollo en la paellera con AOVE 5 min.',
      'Añade el pimiento y la judía cortados. Sofríe 5 min.',
      'Incorpora el tomate rallado y el pimentón. Cocina 2 min.',
      'Añade el arroz, mezcla 1 min, y vierte el caldo caliente con el azafrán.',
      'Cocina 10 min a fuego fuerte y 8 min a fuego suave sin remover.',
      'Apaga y deja reposar 5 min tapado con un paño.',
    ],
  },
  'ensalada de canónigos': {
    tiempo: '5 min',
    dificultad: 'Fácil',
    macros: { kcal: 110, p: 3, c: 8, g: 7 },
    ingredientes: [
      { nombre: 'Canónigos', cantidad: '80 g' },
      { nombre: 'Tomate cherry', cantidad: '80 g' },
      { nombre: 'Queso fresco 0%', cantidad: '30 g' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Vinagre balsámico y sal', cantidad: 'al gusto' },
    ],
    pasos: [
      'Lava bien los canónigos y sécalos.',
      'Corta los cherry por la mitad.',
      'Desmenuza el queso por encima.',
      'Aliña con AOVE, balsámico y sal.',
    ],
  },
  'crema de calabaza': {
    tiempo: '30 min',
    dificultad: 'Fácil',
    macros: { kcal: 180, p: 4, c: 25, g: 7 },
    ingredientes: [
      { nombre: 'Calabaza pelada', cantidad: '300 g' },
      { nombre: 'Puerro', cantidad: '50 g' },
      { nombre: 'Patata', cantidad: '50 g' },
      { nombre: 'Caldo de verduras', cantidad: '300 ml' },
      { nombre: 'AOVE', cantidad: '5 g' },
      { nombre: 'Nuez moscada, sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Pica la calabaza, el puerro y la patata en trozos.',
      'Sofríe en una cazuela con AOVE el puerro 3 min.',
      'Añade la calabaza, patata y caldo. Cuece 20 min hasta que todo esté tierno.',
      'Tritura con batidora hasta obtener una crema fina.',
      'Sazona con nuez moscada, sal y pimienta.',
    ],
  },
  'pavo a la plancha con pimientos': {
    tiempo: '15 min',
    dificultad: 'Fácil',
    macros: { kcal: 240, p: 30, c: 8, g: 8 },
    ingredientes: [
      { nombre: 'Filetes de pavo', cantidad: '130 g' },
      { nombre: 'Pimiento rojo', cantidad: '80 g' },
      { nombre: 'Pimiento verde', cantidad: '80 g' },
      { nombre: 'Ajo', cantidad: '1 diente' },
      { nombre: 'AOVE', cantidad: '6 g' },
      { nombre: 'Sal y pimienta', cantidad: 'al gusto' },
    ],
    pasos: [
      'Corta los pimientos en tiras y saltéalos con el ajo en sartén con la mitad del AOVE 8 min.',
      'Salpimenta el pavo y márcalo en otra sartén con el resto de AOVE 2-3 min por lado.',
      'Sirve el pavo con los pimientos por encima o al lado.',
    ],
  },
};

// Busca una receta por palabras clave dentro del nombre del plato
function findRecipe(plato) {
  const lower = plato.toLowerCase();
  // 1) match exacto por substring de la key
  const sortedKeys = Object.keys(recetas).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) return { key, ...recetas[key] };
  }
  return null;
}

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const shortDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const mealConfig = {
  Desayuno: { icon: Coffee, label: 'Desayuno' },
  Comida: { icon: UtensilsCrossed, label: 'Comida' },
  Cena: { icon: Moon, label: 'Cena' },
};

const PRIMARY = '#1ba5be';

// ---------------------------------------------------------------------------
// COMPONENTES BÁSICOS
// ---------------------------------------------------------------------------
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className="relative shrink-0 inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        backgroundColor: checked ? PRIMARY : '#e5e7eb',
        ['--tw-ring-color']: PRIMARY,
      }}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function Header({ title, subtitle }) {
  return (
    <header
      className="px-5 pt-6 pb-7 text-white"
      style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #138aa0 100%)` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">
            {subtitle}
          </p>
          <h1 className="text-2xl font-bold mt-0.5 leading-tight">{title}</h1>
        </div>
        <div className="h-10 w-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
          <Leaf size={18} />
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// BOTTOM SHEET - DETALLE DE RECETA
// ---------------------------------------------------------------------------
function RecipeSheet({ plato, mealName, onClose }) {
  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (plato) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [plato]);

  if (!plato) return null;

  const receta = findRecipe(plato);
  const MealIcon = mealName ? mealConfig[mealName].icon : ChefHat;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" aria-modal="true">
      {/* Backdrop */}
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/50 animate-backdropIn"
        aria-label="Cerrar"
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-sheetUp"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Handle */}
        <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center z-10">
          <div className="h-1.5 w-12 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="px-5 pb-5 pt-2 text-white relative"
          style={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #0e8aa0 100%)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center hover:bg-white/25 transition"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold opacity-90 mb-1.5">
            <MealIcon size={13} />
            {mealName || 'Receta'}
          </div>
          <h2 className="text-xl font-bold leading-tight pr-10">{plato}</h2>

          {receta && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs font-semibold bg-white/20 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Clock size={12} /> {receta.tiempo}
              </span>
              <span className="text-xs font-semibold bg-white/20 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Flame size={12} /> {receta.dificultad}
              </span>
            </div>
          )}
        </div>

        {receta ? (
          <>
            {/* Macros */}
            <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: 'kcal', value: receta.macros.kcal },
                { label: 'Prot.', value: `${receta.macros.p}g` },
                { label: 'Carb.', value: `${receta.macros.c}g` },
                { label: 'Grasa', value: `${receta.macros.g}g` },
              ].map((m) => (
                <div key={m.label} className="py-3 text-center">
                  <div className="text-base font-bold text-gray-900 tabular-nums">
                    {m.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mt-0.5">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Ingredientes */}
            <section className="px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] uppercase tracking-widest font-bold text-gray-500">
                  Ingredientes
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                  {receta.ingredientes.length} items
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
                {receta.ingredientes.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <span className="text-[15px] text-gray-800">{ing.nombre}</span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: PRIMARY }}
                    >
                      {ing.cantidad}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Preparación */}
            <section className="px-5 pb-6">
              <h3 className="text-[11px] uppercase tracking-widest font-bold text-gray-500 mb-3">
                Preparación
              </h3>
              <ol className="space-y-3">
                {receta.pasos.map((paso, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div
                      className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed pt-0.5">
                      {paso}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </>
        ) : (
          <div className="px-5 py-10 text-center">
            <div className="h-14 w-14 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-3">
              <ChefHat size={22} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 leading-snug">
              No hay receta detallada para este plato todavía.
              <br />
              Es un alimento listo para consumir tal cual.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VISTA 1 — PLAN SEMANAL
// ---------------------------------------------------------------------------
function PlanSemanal({ activeDay, setActiveDay, openRecipe }) {
  const dayData = dietData.planSemanal[activeDay];

  return (
    <div className="pb-28">
      <Header title="Plan Mediterráneo" subtitle="Reducción de grasa · 3 tomas" />

      {/* Selector horizontal de días */}
      <div className="-mt-4 mx-3 mb-5 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 px-2 py-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {days.map((d, i) => {
            const isActive = d === activeDay;
            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className="flex-1 min-w-[52px] py-2 px-1 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: isActive ? PRIMARY : 'transparent',
                  color: isActive ? '#fff' : '#374151',
                }}
              >
                <div className="text-[10px] uppercase tracking-wide opacity-80 font-medium">
                  {shortDays[i]}
                </div>
                <div className="text-base font-bold mt-0.5">{i + 1}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjetas de comidas */}
      <div className="px-4 space-y-4">
        {Object.entries(dayData).map(([mealName, meal]) => {
          const Icon = mealConfig[mealName].icon;
          return (
            <article
              key={mealName}
              className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden"
            >
              <div
                className="px-4 py-3 flex items-center justify-between text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <span className="font-semibold text-[15px] tracking-wide">{mealName}</span>
                </div>
                <span className="text-xs font-medium bg-white/15 px-2.5 py-1 rounded-full">
                  {meal.hora}
                </span>
              </div>

              <ul className="divide-y divide-gray-100">
                {meal.platos.map((plato, idx) => {
                  const hasRecipe = !!findRecipe(plato);
                  return (
                    <li key={idx}>
                      <button
                        onClick={() => openRecipe(plato, mealName)}
                        className="w-full px-4 py-3.5 flex items-center gap-3 text-[15px] text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: PRIMARY }}
                        />
                        <span className="leading-snug flex-1">{plato}</span>
                        {hasRecipe && (
                          <ChevronRight
                            size={18}
                            className="text-gray-400 shrink-0"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}

        {/* Hint */}
        <p className="text-center text-xs text-gray-400 pt-2 pb-1">
          Pulsa cualquier plato para ver ingredientes y preparación
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VISTA 2 — LISTA DE LA COMPRA
// ---------------------------------------------------------------------------
function ListaCompra({
  shoppingTab,
  setShoppingTab,
  shoppingList,
  porPlato,
  boughtGrupo,
  boughtPlato,
  toggleGrupo,
  togglePlato,
  onReset,
}) {
  const activeBought = shoppingTab === 'grupo' ? boughtGrupo : boughtPlato;
  const boughtSet = useMemo(() => new Set(activeBought), [activeBought]);

  const totalItems = useMemo(() => {
    if (shoppingTab === 'grupo') {
      return Object.values(shoppingList).flat();
    }
    return Object.values(porPlato).flat();
  }, [shoppingTab, shoppingList, porPlato]);

  const comprados = totalItems.filter((i) => boughtSet.has(i.id)).length;
  const progreso = totalItems.length ? (comprados / totalItems.length) * 100 : 0;

  return (
    <div className="pb-28 relative">
      <Header title="Lista de la compra" subtitle="Semana actual" />

      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex">
          {[
            { id: 'grupo', label: 'Por grupo' },
            { id: 'plato', label: 'Por plato' },
          ].map((tab) => {
            const isActive = shoppingTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setShoppingTab(tab.id)}
                className="flex-1 py-3.5 text-sm font-semibold relative transition-colors"
                style={{ color: isActive ? PRIMARY : '#6b7280' }}
              >
                {tab.label}
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-t-full transition-all duration-300"
                  style={{
                    width: isActive ? '40%' : '0%',
                    backgroundColor: PRIMARY,
                  }}
                />
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 flex items-center gap-3 bg-gray-50 border-t border-gray-100">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{ width: `${progreso}%`, backgroundColor: PRIMARY }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600 tabular-nums">
            {comprados}/{totalItems.length}
          </span>
          {comprados > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 active:scale-95 transition"
              aria-label="Reiniciar lista"
            >
              <RotateCcw size={13} />
              Reiniciar
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">
        {shoppingTab === 'grupo'
          ? Object.entries(shoppingList).map(([categoria, items]) => (
              <CategorySection
                key={categoria}
                title={categoria}
                items={items}
                boughtSet={boughtSet}
                onToggle={(id) => toggleGrupo(id)}
              />
            ))
          : Object.entries(porPlato).map(([plato, items]) => (
              <CategorySection
                key={plato}
                title={plato}
                items={items}
                boughtSet={boughtSet}
                onToggle={(id) => togglePlato(id)}
                isDish
              />
            ))}
      </div>

      <button
        className="fixed bottom-24 right-5 h-14 w-14 rounded-full text-white shadow-lg active:scale-95 transition-transform z-20 flex items-center justify-center"
        style={{
          backgroundColor: PRIMARY,
          boxShadow: '0 8px 24px -4px rgba(27, 165, 190, 0.5)',
        }}
        aria-label="Añadir ingrediente"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function CategorySection({ title, items, onToggle, isDish, boughtSet }) {
  return (
    <section>
      <h3
        className={`text-[11px] font-bold uppercase tracking-[0.12em] mb-2.5 px-1 ${
          isDish ? 'text-gray-500' : ''
        }`}
        style={!isDish ? { color: '#6b8073' } : undefined}
      >
        {title}
      </h3>
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm overflow-hidden">
        {items.map((item, idx) => {
          const comprado = boughtSet.has(item.id);
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between px-4 py-3.5 ${
                idx !== items.length - 1 ? 'border-b border-gray-100' : ''
              } ${comprado ? 'opacity-50' : ''} transition-opacity`}
            >
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[15px] font-medium text-gray-800 truncate ${
                    comprado ? 'line-through' : ''
                  }`}
                >
                  {item.nombre}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 font-medium tabular-nums">
                  {item.cantidad}
                </div>
              </div>
              <Toggle checked={comprado} onChange={() => onToggle(item.id)} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// VISTA 3 — GENERADOR
// ---------------------------------------------------------------------------
function Generador({ generated, generating, generate, openRecipe }) {
  return (
    <div className="pb-28">
      <Header title="Generador de Comidas" subtitle="Reducción de grasa · Mediterránea" />

      <div className="mx-4 -mt-4 mb-5">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(27,165,190,0.12)', color: PRIMARY }}
          >
            <ChefHat size={22} />
          </div>
          <div className="text-sm text-gray-600 leading-snug">
            Recetas pensadas para{' '}
            <span className="font-semibold text-gray-800">reducir grasa corporal</span> — proteína magra, hidratos complejos y verduras.
          </div>
        </div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        <GeneratorButton
          icon={UtensilsCrossed}
          label="Comida"
          subtitle="Plato principal"
          onClick={() => generate('comida')}
          disabled={generating}
        />
        <GeneratorButton
          icon={Moon}
          label="Cena"
          subtitle="Ligera y completa"
          onClick={() => generate('cena')}
          disabled={generating}
        />
      </div>

      <div className="px-4 mt-6">
        {generated ? (
          <ResultCard meal={generated} openRecipe={openRecipe} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function GeneratorButton({ icon: Icon, label, subtitle, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-4 text-left active:scale-[0.98] transition-all hover:shadow-md disabled:opacity-50"
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: PRIMARY, color: 'white' }}
      >
        <Icon size={20} />
      </div>
      <div className="text-base font-bold text-gray-900">Generar {label}</div>
      <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
      <div
        className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: PRIMARY }}
      >
        <Shuffle size={13} />
        Aleatoria
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-dashed ring-gray-200 p-8 text-center">
      <div className="h-14 w-14 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-3">
        <Sparkles size={22} className="text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 leading-snug">
        Pulsa un botón para generar
        <br />
        una receta para tu dieta.
      </p>
    </div>
  );
}

function ResultCard({ meal, openRecipe }) {
  return (
    <article className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden animate-fadeIn">
      <div
        className="px-5 py-4 text-white"
        style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #0e8aa0 100%)` }}
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold opacity-90">
          <Sparkles size={13} />
          {meal.type === 'comida' ? 'Comida sugerida' : 'Cena sugerida'}
        </div>
        <h2 className="text-xl font-bold mt-1 leading-tight">{meal.titulo}</h2>
      </div>

      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        {[
          { label: 'kcal', value: meal.macros.kcal },
          { label: 'Prot.', value: `${meal.macros.p}g` },
          { label: 'Carb.', value: `${meal.macros.c}g` },
          { label: 'Grasa', value: `${meal.macros.g}g` },
        ].map((m) => (
          <div key={m.label} className="py-3 text-center">
            <div className="text-base font-bold text-gray-900 tabular-nums">{m.value}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mt-0.5">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4">
        <div className="text-[11px] uppercase tracking-widest font-bold text-gray-500 mb-3">
          Ingredientes
        </div>
        <ul className="space-y-2.5">
          {meal.ingredientes.map((ing, idx) => (
            <li key={idx} className="flex items-start gap-3 text-[15px] text-gray-700">
              <span
                className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: PRIMARY }}
              />
              <span>{ing}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => openRecipe(meal.titulo, meal.type === 'comida' ? 'Comida' : 'Cena')}
          className="mt-5 w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ backgroundColor: PRIMARY }}
        >
          Ver preparación paso a paso
          <ChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// BOTTOM NAVIGATION
// ---------------------------------------------------------------------------
function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'plan', label: 'Plan', icon: Calendar },
    { id: 'lista', label: 'Compra', icon: ShoppingCart },
    { id: 'generador', label: 'Generador', icon: Sparkles },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30"
      style={{ boxShadow: '0 -2px 12px -2px rgba(0,0,0,0.04)' }}
    >
      <div className="grid grid-cols-3 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="py-2.5 flex flex-col items-center gap-1 transition-colors relative"
            >
              <div
                className="flex items-center justify-center h-10 w-14 rounded-2xl transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'rgba(27,165,190,0.12)' : 'transparent',
                  color: isActive ? PRIMARY : '#9ca3af',
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              </div>
              <span
                className="text-[11px] font-semibold"
                style={{ color: isActive ? PRIMARY : '#9ca3af' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  );
}

// ---------------------------------------------------------------------------
// MAIN APP
// ---------------------------------------------------------------------------
export default function NutriPlanApp() {
  const [activeTab, setActiveTab] = useState('plan');
  const [activeDay, setActiveDay] = usePersistedState('nutriplan.activeDay', 'Lunes');
  const [shoppingTab, setShoppingTab] = useState('grupo');
  const [generated, setGenerated] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Datos base (estáticos)
  const shoppingList = dietData.listaCompra;
  const porPlato = dietData.porPlato;

  // IDs comprados persistidos en localStorage (robusto ante cambios del plan)
  const defaultGrupo = useMemo(
    () =>
      Object.values(dietData.listaCompra)
        .flat()
        .filter((i) => i.comprado)
        .map((i) => i.id),
    []
  );
  const defaultPlato = useMemo(
    () =>
      Object.values(dietData.porPlato)
        .flat()
        .filter((i) => i.comprado)
        .map((i) => i.id),
    []
  );

  const [boughtGrupo, setBoughtGrupo] = usePersistedState(
    'nutriplan.bought.grupo',
    defaultGrupo
  );
  const [boughtPlato, setBoughtPlato] = usePersistedState(
    'nutriplan.bought.plato',
    defaultPlato
  );

  // Estado del modal de receta
  const [recipeModal, setRecipeModal] = useState({ plato: null, mealName: null });
  const openRecipe = (plato, mealName) => setRecipeModal({ plato, mealName });
  const closeRecipe = () => setRecipeModal({ plato: null, mealName: null });

  const toggleGrupo = (id) => {
    setBoughtGrupo((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const togglePlato = (id) => {
    setBoughtPlato((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const resetList = () => {
    if (shoppingTab === 'grupo') setBoughtGrupo([]);
    else setBoughtPlato([]);
  };

  const generate = (type) => {
    setGenerating(true);
    setGenerated(null);
    setTimeout(() => {
      const list = type === 'comida' ? dietData.generador.comidas : dietData.generador.cenas;
      const random = list[Math.floor(Math.random() * list.length)];
      setGenerated({ ...random, type });
      setGenerating(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto font-sans antialiased text-gray-900 relative">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fadeIn    { animation: fadeIn 0.35s ease-out; }
        .animate-sheetUp   { animation: sheetUp 0.32s cubic-bezier(0.32, 0.72, 0, 1); }
        .animate-backdropIn{ animation: backdropIn 0.25s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {activeTab === 'plan' && (
        <PlanSemanal
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          openRecipe={openRecipe}
        />
      )}
      {activeTab === 'lista' && (
        <ListaCompra
          shoppingTab={shoppingTab}
          setShoppingTab={setShoppingTab}
          shoppingList={shoppingList}
          porPlato={porPlato}
          boughtGrupo={boughtGrupo}
          boughtPlato={boughtPlato}
          toggleGrupo={toggleGrupo}
          togglePlato={togglePlato}
          onReset={resetList}
        />
      )}
      {activeTab === 'generador' && (
        <Generador
          generated={generated}
          generating={generating}
          generate={generate}
          openRecipe={openRecipe}
        />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <RecipeSheet
        plato={recipeModal.plato}
        mealName={recipeModal.mealName}
        onClose={closeRecipe}
      />
    </div>
  );
}
