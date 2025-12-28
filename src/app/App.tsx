import { useState } from "react";
import { Header } from "./components/Header";
import { HeroCarousel } from "./components/HeroCarousel";
import { ConcertCarousel } from "./components/ConcertCarousel";
import { TicketSelector } from "./components/TicketSelector";
import { Cart } from "./components/Cart";
import { Concert, CartItem } from "./types";

const concerts: Concert[] = [
  {
    id: "1",
    artist: "Los Tigres del Norte",
    tour: "Gira 2025",
    date: "15 de Enero, 2025",
    time: "21:00 hrs",
    venue: "Arena Monterrey",
    image: "https://images.unsplash.com/photo-1764649841400-e502bb1ee65b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXRpbiUyMG11c2ljJTIwY29uY2VydHxlbnwxfHx8fDE3NjYxMTIzMjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 850,
    sections: [
      {
        id: "vip-1",
        name: "VIP - Frente al Escenario",
        description: "Acceso preferente, asiento numerado, meet & greet",
        price: 2500,
        available: 50,
      },
      {
        id: "preferente-1",
        name: "Preferente",
        description: "Asientos numerados, excelente vista",
        price: 1500,
        available: 120,
      },
      {
        id: "general-1",
        name: "General A",
        description: "De pie, cerca del escenario",
        price: 1200,
        available: 200,
      },
      {
        id: "balcon-1",
        name: "Balcón",
        description: "Asientos numerados en balcón",
        price: 850,
        available: 150,
      },
    ],
  },
  {
    id: "2",
    artist: "Café Tacvba",
    tour: "Un Viaje Tour",
    date: "22 de Enero, 2025",
    time: "20:30 hrs",
    venue: "Auditorio Citibanamex",
    image: "https://images.unsplash.com/photo-1762917903361-99e0164dbcc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwYmFuZCUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc2NjA0MDUzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 750,
    sections: [
      {
        id: "vip-2",
        name: "VIP Platino",
        description: "Mejor ubicación, asiento numerado",
        price: 2200,
        available: 40,
      },
      {
        id: "preferente-2",
        name: "Preferente A",
        description: "Asientos numerados, zona premium",
        price: 1400,
        available: 100,
      },
      {
        id: "general-2",
        name: "General",
        description: "De pie, zona general",
        price: 950,
        available: 250,
      },
      {
        id: "balcon-2",
        name: "Balcón Superior",
        description: "Asientos numerados",
        price: 750,
        available: 180,
      },
    ],
  },
  {
    id: "3",
    artist: "Molotov",
    tour: "Donde Jugarán Tour",
    date: "5 de Febrero, 2025",
    time: "21:30 hrs",
    venue: "Showcenter Complex",
    image: "https://images.unsplash.com/photo-1709731191876-899e32264420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwc3RhZ2UlMjBsaWdodHN8ZW58MXx8fHwxNzY2MDE3NDY4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 900,
    sections: [
      {
        id: "vip-3",
        name: "VIP Gold",
        description: "Acceso exclusivo, open bar",
        price: 2800,
        available: 30,
      },
      {
        id: "preferente-3",
        name: "Preferente",
        description: "Asientos numerados cercanos",
        price: 1600,
        available: 90,
      },
      {
        id: "general-3",
        name: "General A",
        description: "De pie, zona frontal",
        price: 1200,
        available: 180,
      },
      {
        id: "general-b-3",
        name: "General B",
        description: "De pie, zona trasera",
        price: 900,
        available: 220,
      },
    ],
  },
  {
    id: "4",
    artist: "Caifanes",
    tour: "El Diablito Tour",
    date: "14 de Febrero, 2025",
    time: "20:00 hrs",
    venue: "Estadio Universitario",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2R8ZW58MXx8fHwxNzY2MDYzMDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 1100,
    sections: [
      {
        id: "vip-4",
        name: "VIP Diamante",
        description: "Paquete premium con amenidades",
        price: 3500,
        available: 25,
      },
      {
        id: "preferente-4",
        name: "Preferente Oro",
        description: "Asientos numerados premium",
        price: 2000,
        available: 80,
      },
      {
        id: "general-4",
        name: "General Numerado",
        description: "Asientos numerados zona general",
        price: 1400,
        available: 300,
      },
      {
        id: "tribune-4",
        name: "Tribuna",
        description: "Asientos en tribuna",
        price: 1100,
        available: 400,
      },
    ],
  },
  {
    id: "5",
    artist: "Zoé",
    tour: "Sonidos de Kármika Resonancia",
    date: "28 de Febrero, 2025",
    time: "21:00 hrs",
    venue: "Arena Monterrey",
    image: "https://images.unsplash.com/photo-1692176548571-86138128e36c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWMlMjBkanxlbnwxfHx8fDE3NjYxMTIzMjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 950,
    sections: [
      {
        id: "vip-5",
        name: "VIP Experiencia",
        description: "Meet & greet, mercancía exclusiva",
        price: 2900,
        available: 35,
      },
      {
        id: "preferente-5",
        name: "Preferente Plus",
        description: "Asientos premium numerados",
        price: 1700,
        available: 110,
      },
      {
        id: "general-5",
        name: "General",
        description: "De pie, acceso general",
        price: 1100,
        available: 240,
      },
      {
        id: "balcon-5",
        name: "Balcón",
        description: "Asientos en balcón",
        price: 950,
        available: 160,
      },
    ],
  },
  {
    id: "6",
    artist: "Kinky",
    tour: "Nada de Nada Tour",
    date: "12 de Marzo, 2025",
    time: "22:00 hrs",
    venue: "House of Blues",
    image: "https://images.unsplash.com/photo-1523198421516-973dc001a953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBhcnRpc3QlMjBzdGFnZXxlbnwxfHx8fDE3NjYxMTIzMjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 800,
    sections: [
      {
        id: "vip-6",
        name: "VIP Lounge",
        description: "Área VIP con barra privada",
        price: 2400,
        available: 20,
      },
      {
        id: "preferente-6",
        name: "Preferente",
        description: "Mesa reservada, asientos",
        price: 1500,
        available: 60,
      },
      {
        id: "general-6",
        name: "General Pista",
        description: "De pie, cerca del escenario",
        price: 1000,
        available: 150,
      },
      {
        id: "mezzanine-6",
        name: "Mezzanine",
        description: "Segundo piso, asientos",
        price: 800,
        available: 100,
      },
    ],
  },
  {
    id: "7",
    artist: "Maná",
    tour: "México Lindo y Querido Tour",
    date: "25 de Marzo, 2025",
    time: "21:00 hrs",
    venue: "Estadio Tecnológico",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwY29uY2VydHxlbnwxfHx8fDE3NjYxMTIzMjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 1200,
    sections: [
      {
        id: "vip-7",
        name: "VIP Preferente",
        description: "Mejor vista, asientos premium",
        price: 3200,
        available: 45,
      },
      {
        id: "preferente-7",
        name: "Preferente A",
        description: "Asientos numerados zona premium",
        price: 1900,
        available: 130,
      },
      {
        id: "general-7",
        name: "General Campo",
        description: "De pie en el campo",
        price: 1500,
        available: 350,
      },
      {
        id: "tribune-7",
        name: "Tribuna",
        description: "Asientos en tribuna",
        price: 1200,
        available: 280,
      },
    ],
  },
  {
    id: "8",
    artist: "Reik",
    tour: "Ahora Tour",
    date: "8 de Abril, 2025",
    time: "20:30 hrs",
    venue: "Auditorio Pabellón M",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3AlMjBjb25jZXJ0fGVufDF8fHx8MTc2NjExMjMyMXww&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 700,
    sections: [
      {
        id: "vip-8",
        name: "VIP Meet & Greet",
        description: "Incluye foto y firma",
        price: 2600,
        available: 30,
      },
      {
        id: "preferente-8",
        name: "Preferente",
        description: "Asientos numerados cercanos",
        price: 1300,
        available: 95,
      },
      {
        id: "general-8",
        name: "General",
        description: "De pie, zona general",
        price: 900,
        available: 200,
      },
      {
        id: "balcon-8",
        name: "Balcón",
        description: "Asientos en balcón",
        price: 700,
        available: 140,
      },
    ],
  },
  {
    id: "9",
    artist: "Intocable",
    tour: "Historia de Amor Tour",
    date: "22 de Abril, 2025",
    time: "21:30 hrs",
    venue: "Arena VFG",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwbXVzaWN8ZW58MXx8fHwxNzY2MTEyMzIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 880,
    sections: [
      {
        id: "vip-9",
        name: "VIP Platino",
        description: "Acceso preferente, bar incluido",
        price: 2700,
        available: 38,
      },
      {
        id: "preferente-9",
        name: "Preferente Gold",
        description: "Asientos premium numerados",
        price: 1600,
        available: 105,
      },
      {
        id: "general-9",
        name: "General A",
        description: "De pie, zona frontal",
        price: 1150,
        available: 190,
      },
      {
        id: "general-b-9",
        name: "General B",
        description: "De pie, zona posterior",
        price: 880,
        available: 235,
      },
    ],
  },
  {
    id: "10",
    artist: "Mon Laferte",
    tour: "Autopoiética Tour",
    date: "6 de Mayo, 2025",
    time: "20:00 hrs",
    venue: "Teatro Fundidora",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nZXIlMjBvbiUyMHN0YWdlfGVufDF8fHx8MTc2NjExMjMyMXww&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 950,
    sections: [
      {
        id: "vip-10",
        name: "VIP Exclusivo",
        description: "Primera fila, beneficios especiales",
        price: 3100,
        available: 22,
      },
      {
        id: "preferente-10",
        name: "Preferente",
        description: "Asientos numerados premium",
        price: 1800,
        available: 75,
      },
      {
        id: "general-10",
        name: "General Numerado",
        description: "Asientos numerados",
        price: 1250,
        available: 165,
      },
      {
        id: "balcon-10",
        name: "Balcón",
        description: "Vista panorámica",
        price: 950,
        available: 120,
      },
    ],
  },
  {
    id: "11",
    artist: "Panteón Rococó",
    tour: "La Carencia Tour",
    date: "20 de Mayo, 2025",
    time: "22:00 hrs",
    venue: "Explanada Fundidora",
    image: "https://images.unsplash.com/photo-1501612780327-45045538702b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwZmVzdGl2YWx8ZW58MXx8fHwxNzY2MTEyMzIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 750,
    sections: [
      {
        id: "vip-11",
        name: "VIP Arena",
        description: "Zona exclusiva frente al escenario",
        price: 2300,
        available: 40,
      },
      {
        id: "preferente-11",
        name: "Preferente",
        description: "Zona numerada cercana",
        price: 1400,
        available: 110,
      },
      {
        id: "general-11",
        name: "General",
        description: "De pie, acceso general",
        price: 980,
        available: 280,
      },
      {
        id: "grada-11",
        name: "Grada",
        description: "Asientos en grada",
        price: 750,
        available: 195,
      },
    ],
  },
  {
    id: "12",
    artist: "Natalia Lafourcade",
    tour: "De Todas las Flores Tour",
    date: "3 de Junio, 2025",
    time: "20:30 hrs",
    venue: "Auditorio Citibanamex",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGNvbmNlcnR8ZW58MXx8fHwxNzY2MTEyMzIxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    minPrice: 1050,
    sections: [
      {
        id: "vip-12",
        name: "VIP Premium",
        description: "Mejor ubicación, amenidades incluidas",
        price: 2950,
        available: 28,
      },
      {
        id: "preferente-12",
        name: "Preferente A",
        description: "Asientos premium cercanos",
        price: 1750,
        available: 88,
      },
      {
        id: "general-12",
        name: "General",
        description: "Asientos numerados generales",
        price: 1300,
        available: 175,
      },
      {
        id: "balcon-12",
        name: "Balcón Superior",
        description: "Asientos en balcón",
        price: 1050,
        available: 145,
      },
    ],
  },
];

export default function App() {
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const handleAddToCart = (items: CartItem[]) => {
    setCartItems(prev => [...prev, ...items]);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    alert("Funcionalidad de pago próximamente. Total: $" + 
      (cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1).toLocaleString() + 
      " MXN");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a2c30] to-[#49484e]">
      <Header 
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setShowCart(true)}
      />

      <main className="w-full py-8">
        {/* Carrusel Hero de Eventos Destacados */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <HeroCarousel
            concerts={concerts.slice(0, 4)}
            onSelectConcert={setSelectedConcert}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" id="eventos">
            <h1 className="text-white mb-4">Próximos Conciertos</h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Descubre los mejores eventos en vivo. Compra tus boletos de manera segura y rápida.
            </p>
          </div>
        </div>

        {/* Primer carrusel - Primeros eventos */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-white text-xl font-semibold mb-6 px-4 sm:px-6 lg:px-8">Eventos Destacados</h2>
          <div className="group">
            <ConcertCarousel
              concerts={concerts.slice(0, 6)}
              onSelectConcert={setSelectedConcert}
            />
          </div>
        </div>

        {/* Segundo carrusel - Siguientes eventos */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-white text-xl font-semibold mb-6 px-4 sm:px-6 lg:px-8">Más Eventos</h2>
          <div className="group">
            <ConcertCarousel
              concerts={concerts.slice(6, 12)}
              onSelectConcert={setSelectedConcert}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-[#c4a905]/20">
            <h2 className="text-white text-center mb-4">¿Por qué comprar con Grupo Regia?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#c4a905] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#f9fbf6]">✓</span>
                </div>
                <h4 className="text-white mb-2">Boletos Garantizados</h4>
                <p className="text-white/70">
                  Todos nuestros boletos son 100% auténticos y verificados
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#c4a905] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#f9fbf6]">★</span>
                </div>
                <h4 className="text-white mb-2">Mejor Precio</h4>
                <p className="text-white/70">
                  Precios competitivos sin comisiones ocultas
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#c4a905] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#f9fbf6]">♥</span>
                </div>
                <h4 className="text-white mb-2">Soporte 24/7</h4>
                <p className="text-white/70">
                  Estamos aquí para ayudarte en cualquier momento
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#49484e] border-t border-[#c4a905]/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-white/60 text-center">
            © 2025 Grupo Regia. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {selectedConcert && (
        <TicketSelector
          concert={selectedConcert}
          onClose={() => setSelectedConcert(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {showCart && (
        <Cart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}
