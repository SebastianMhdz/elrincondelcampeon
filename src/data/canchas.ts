import cancha1 from "@/assets/cancha-1.jpg";
import cancha2 from "@/assets/cancha-2.jpg";
import cancha3 from "@/assets/cancha-3.jpg";
import cancha4 from "@/assets/cancha-4.jpg";
import cancha5 from "@/assets/cancha-5.jpg";
import cancha6 from "@/assets/cancha-6.jpg";
import cancha7 from "@/assets/cancha-7.jpg";
import cancha8 from "@/assets/cancha-8.jpg";

export interface Ruta {
  tipo: "urbano" | "troncal" | "uber";
  linea: string;
  parada: string;
  distancia: string;
  duracion: string;
}

export interface Cancha {
  id: number;
  name: string;
  addr: string;
  lat: number;
  lng: number;
  rating: number;
  reviews_count: number;
  phone: string;
  hours: string;
  precio: string;
  precioMin: number;
  servicios: string[];
  rutas: Ruta[];
  reviews: string[];
  icon: string;
  tipo: string;
  image: string;
  benefits?: string[];
  socialLinks?: { instagram?: string; facebook?: string; website?: string };
  galleryUrls?: string[];
}

export const canchas: Cancha[] = [
  {
    id: 0,
    name: "FSB La Cancha",
    addr: "La Concepción, Barranquilla",
    lat: 11.0138195, lng: -74.7969872,
    rating: 4.6, reviews_count: 664,
    phone: "+573008438975",
    hours: "Abierto 24 horas",
    precio: "$80.000 – $120.000/hora",
    precioMin: 80000,
    servicios: ["Iluminación nocturna", "Parqueadero", "Camerinos", "Balones", "Bebidas", "Abierto 24h"],
    rutas: [
      { tipo: "troncal", linea: "Transmetro", parada: "Estación La Concepción", distancia: "5 min caminando", duracion: "20 min" },
      { tipo: "urbano", linea: "Bus Sobusa 43", parada: "Cra 43 con Cl 79", distancia: "8 min caminando", duracion: "35 min" },
      { tipo: "uber", linea: "Uber / InDriver", parada: "Puerta a puerta", distancia: "Directo", duracion: "15–25 min" },
    ],
    reviews: ["Excelente cancha, gramilla en perfecto estado", "Buen lugar para jugar de noche", "La mejor cancha 24h de Barranquilla"],
    icon: "⚽",
    tipo: "Fútbol 5 y 6",
    image: cancha1,
  },
  {
    id: 1,
    name: "Cancha Sintética Zoccer Plaza",
    addr: "Cl. 77 #58-53, Barranquilla",
    lat: 11.0061857, lng: -74.8019,
    rating: 4.4, reviews_count: 234,
    phone: "+573013790228",
    hours: "Lun–Dom 6AM – 12AM",
    precio: "$70.000 – $110.000/hora",
    precioMin: 70000,
    servicios: ["Gramilla sintética premium", "Camerinos", "Parqueadero", "Tribuna", "Balones", "Bebidas"],
    rutas: [
      { tipo: "urbano", linea: "Bus Carolina 66", parada: "Cra 58 con Cl 77", distancia: "2 min caminando", duracion: "30 min" },
      { tipo: "troncal", linea: "Transmetro", parada: "Estación Villa Country", distancia: "12 min a pie", duracion: "25 min" },
      { tipo: "uber", linea: "Uber / InDriver", parada: "Puerta a puerta", distancia: "Directo", duracion: "12–20 min" },
    ],
    reviews: ["Cancha con ubicación cómoda", "Buenas instalaciones y parqueadero"],
    icon: "🏟",
    tipo: "Fútbol 5, 6 y 7",
    image: cancha2,
  },
  {
    id: 2,
    name: "Canchas El Tiburón",
    addr: "Murillo Toro #36-36, Barranquilla",
    lat: 10.9784932, lng: -74.7872513,
    rating: 4.4, reviews_count: 513,
    phone: "+576053793131",
    hours: "Lun–Dom 6AM – 12AM",
    precio: "$65.000 – $100.000/hora",
    precioMin: 65000,
    servicios: ["Gramilla sintética", "Parqueadero motos", "Iluminación", "Bebidas", "Snacks"],
    rutas: [
      { tipo: "urbano", linea: "Bus Sobusa 45", parada: "Av. Murillo con Cra 36", distancia: "3 min caminando", duracion: "25 min" },
      { tipo: "urbano", linea: "Bus Coolitoral 70", parada: "Murillo con 38", distancia: "5 min caminando", duracion: "30 min" },
      { tipo: "uber", linea: "Uber / InDriver", parada: "Puerta a puerta", distancia: "Directo", duracion: "10–18 min" },
    ],
    reviews: ["Excelentes canchas", "Buen ambiente", "Lugar agradable para jugar"],
    icon: "⚡",
    tipo: "Fútbol 5 y 6",
    image: cancha3,
  },
  {
    id: 3,
    name: "Cancha Sintética Rojiblanca",
    addr: "Cl. 56 #41a-112, El Recreo, Barranquilla",
    lat: 10.9838908, lng: -74.7941152,
    rating: 4.5, reviews_count: 275,
    phone: "+576053781958",
    hours: "Lun–Dom 6AM – 12:30AM",
    precio: "$70.000 – $100.000/hora",
    precioMin: 70000,
    servicios: ["Gramilla en perfectas condiciones", "Kiosko de bebidas", "Camerinos", "Eventos", "Fútbol 8×8"],
    rutas: [
      { tipo: "urbano", linea: "Bus Sobusa 56", parada: "Cl 56 con Cra 41", distancia: "2 min caminando", duracion: "28 min" },
      { tipo: "urbano", linea: "Bus Carolina 32", parada: "El Recreo", distancia: "6 min caminando", duracion: "35 min" },
      { tipo: "uber", linea: "Uber / InDriver", parada: "Puerta a puerta", distancia: "Directo", duracion: "12–22 min" },
    ],
    reviews: ["Cancha en perfecto estado", "Ambiente familiar", "Excelente servicio"],
    icon: "🔴",
    tipo: "Fútbol 8 (8×8)",
    image: cancha4,
  },
  {
    id: 4,
    name: "La Patiada",
    addr: "Cra. 20 #301, Sur Orient, Barranquilla",
    lat: 10.9568088, lng: -74.7866715,
    rating: 4.3, reviews_count: 625,
    phone: "+573014258786",
    hours: "Lun–Dom 8AM – 1AM",
    precio: "$60.000 – $95.000/hora",
    precioMin: 60000,
    servicios: ["Gramilla sintética", "Estacionamiento", "Iluminación LED", "Bebidas", "Snacks", "Transmisión de partidos"],
    rutas: [
      { tipo: "urbano", linea: "Bus Sobusa 20", parada: "Cra 20 con Cl 30", distancia: "4 min caminando", duracion: "30 min" },
      { tipo: "urbano", linea: "Bus Coolitoral 55", parada: "Sur Orient", distancia: "7 min caminando", duracion: "40 min" },
      { tipo: "uber", linea: "Uber / InDriver", parada: "Puerta a puerta", distancia: "Directo", duracion: "15–25 min" },
    ],
    reviews: ["Bacano para jugar", "Súper ambiente"],
    icon: "🏅",
    tipo: "Fútbol 5 y 6",
    image: cancha5,
  },
  {
    id: 5,
    name: "Canchas Sintéticas la 27",
    addr: "Cra. 27 #84-131, Suroccidente, Barranquilla",
    lat: 10.9770681, lng: -74.8286999,
    rating: 4.6, reviews_count: 42,
    phone: "+573008003198",
    hours: "Lun–Dom 9AM – 12AM",
    precio: "$70.000 – $110.000/hora",
    precioMin: 70000,
    servicios: ["2 canchas sintéticas", "Parqueadero propio", "Ventilación natural", "Bebidas para la venta", "Ambiente familiar"],
    rutas: [
      { tipo: "urbano", linea: "Bus Sobusa 27", parada: "Cra 27 con Cl 84", distancia: "1 min caminando", duracion: "35 min" },
      { tipo: "urbano", linea: "Bus Carolina 84", parada: "Cl 84 con Cra 28", distancia: "4 min caminando", duracion: "30 min" },
      { tipo: "uber", linea: "Uber / InDriver", parada: "Puerta a puerta", distancia: "Directo", duracion: "18–28 min" },
    ],
    reviews: ["Dos canchas sintéticas de buena calidad", "Excelente lugar deportivo", "Buen servicio"],
    icon: "🟢",
    tipo: "Fútbol 5 y 6",
    image: cancha6,
  },
  {
    id: 6,
    name: "Cancha Sintética Brasileirao",
    addr: "Cra. 46 #76-109, El Porvenir, Barranquilla",
    lat: 10.9971569, lng: -74.8111439,
    rating: 4.4, reviews_count: 526,
    phone: "+573128603063",
    hours: "Lun 7AM–10PM / Mar–Dom 24h",
    precio: "$75.000 – $115.000/hora",
    precioMin: 75000,
    servicios: ["Gramilla sintética", "Iluminación", "Parqueadero", "Bebidas", "Equipo para 10-12 jugadores", "Ambiente grupal"],
    rutas: [
      { tipo: "urbano", linea: "Bus Sobusa 46", parada: "Cra 46 con Cl 76", distancia: "2 min caminando", duracion: "25 min" },
      { tipo: "troncal", linea: "Transmetro", parada: "Estación El Porvenir", distancia: "10 min caminando", duracion: "20 min" },
      { tipo: "uber", linea: "Uber / InDriver", parada: "Puerta a puerta", distancia: "Directo", duracion: "14–22 min" },
    ],
    reviews: ["Buena cancha para pasar el rato con amigos", "Buena ubicación y precios", "Gran lugar para jugar fútbol"],
    icon: "🇧🇷",
    tipo: "Fútbol 5 y 6",
    image: cancha7,
  },
  {
    id: 7,
    name: "Soccer House",
    addr: "Sabanilla Montecarmelo, Barranquilla",
    lat: 11.0236431, lng: -74.8616841,
    rating: 5.0, reviews_count: 3,
    phone: "+573107660001",
    hours: "Lun–Dom 7AM – 11PM",
    precio: "$85.000 – $130.000/hora",
    precioMin: 85000,
    servicios: ["La mejor cancha de la ciudad", "Ideal para cumpleaños", "Camerinos premium", "Iluminación", "Parqueadero", "Servicio personalizado"],
    rutas: [
      { tipo: "urbano", linea: "Bus Sabanilla", parada: "Montecarmelo", distancia: "5 min caminando", duracion: "40 min" },
      { tipo: "uber", linea: "Uber / InDriver", parada: "Puerta a puerta", distancia: "Directo", duracion: "20–30 min" },
    ],
    reviews: ["¡La mejor cancha de la ciudad!", "Muy buena cancha, recomendada para cumpleaños"],
    icon: "🏠",
    tipo: "Fútbol 5 y 6",
    image: cancha8,
  },
];
