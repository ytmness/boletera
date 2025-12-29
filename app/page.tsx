"use client";

import { useState } from "react";
import { Header } from "@/components/eventos/Header";
import { HeroCarousel } from "@/components/eventos/HeroCarousel";
import { ConcertCarousel } from "@/components/eventos/ConcertCarousel";
import { TicketSelector } from "@/components/eventos/TicketSelector";
import { Cart } from "@/components/eventos/Cart";
import { CartItem, Concert } from "@/components/eventos/types";

const concerts: Concert[] = [
  {
    id: "1",
    artist: "Víctor Mendivil",
    tour: "En Concierto 2025",
    date: "15 de Marzo, 2025",
    time: "21:00 hrs",
    venue: "Arena Monterrey",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200",
    minPrice: 850,
    sections: [
      {
        id: "vip-1",
        name: "VIP - Mesa 4 personas",
        description: "Mesa VIP con 4 asientos, acceso preferente",
        price: 2500,
        available: 30,
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
        name: "General",
        description: "De pie, cerca del escenario",
        price: 850,
        available: 350,
      },
    ],
  },
  {
    id: "2",
    artist: "Los Tigres del Norte",
    tour: "Gira 2025",
    date: "22 de Marzo, 2025",
    time: "21:00 hrs",
    venue: "Arena Monterrey",
    image: "https://images.unsplash.com/photo-1764649841400-e502bb1ee65b?w=1200",
    minPrice: 900,
    sections: [
      {
        id: "vip-2",
        name: "VIP - Frente al Escenario",
        description: "Acceso preferente, meet & greet",
        price: 2800,
        available: 50,
      },
      {
        id: "preferente-2",
        name: "Preferente",
        description: "Asientos numerados",
        price: 1600,
        available: 120,
      },
      {
        id: "general-2",
        name: "General",
        description: "De pie, cerca del escenario",
        price: 1200,
        available: 200,
      },
    ],
  },
  {
    id: "3",
    artist: "Café Tacvba",
    tour: "Un Viaje Tour",
    date: "5 de Abril, 2025",
    time: "20:30 hrs",
    venue: "Auditorio Citibanamex",
    image: "https://images.unsplash.com/photo-1762917903361-99e0164dbcc5?w=1200",
    minPrice: 750,
    sections: [
      {
        id: "vip-3",
        name: "VIP Platino",
        description: "Mejor ubicación",
        price: 2200,
        available: 40,
      },
      {
        id: "preferente-3",
        name: "Preferente A",
        description: "Zona premium",
        price: 1400,
        available: 100,
      },
      {
        id: "general-3",
        name: "General",
        description: "De pie",
        price: 950,
        available: 250,
      },
    ],
  },
  {
    id: "4",
    artist: "Molotov",
    tour: "Donde Jugarán Tour",
    date: "20 de Abril, 2025",
    time: "21:30 hrs",
    venue: "Showcenter Complex",
    image: "https://images.unsplash.com/photo-1709731191876-899e32264420?w=1200",
    minPrice: 900,
    sections: [
      {
        id: "vip-4",
        name: "VIP Gold",
        description: "Acceso exclusivo, open bar",
        price: 2800,
        available: 30,
      },
      {
        id: "preferente-4",
        name: "Preferente",
        description: "Asientos numerados",
        price: 1600,
        available: 90,
      },
      {
        id: "general-4",
        name: "General",
        description: "De pie",
        price: 900,
        available: 220,
      },
    ],
  },
  {
    id: "5",
    artist: "Caifanes",
    tour: "El Diablito Tour",
    date: "10 de Mayo, 2025",
    time: "20:00 hrs",
    venue: "Estadio Universitario",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200",
    minPrice: 1100,
    sections: [
      {
        id: "vip-5",
        name: "VIP Diamante",
        description: "Paquete premium",
        price: 3500,
        available: 25,
      },
      {
        id: "preferente-5",
        name: "Preferente Oro",
        description: "Asientos premium",
        price: 2000,
        available: 80,
      },
      {
        id: "general-5",
        name: "General Numerado",
        description: "Asientos numerados",
        price: 1400,
        available: 300,
      },
    ],
  },
  {
    id: "6",
    artist: "Zoé",
    tour: "Sonidos de Kármika Resonancia",
    date: "25 de Mayo, 2025",
    time: "21:00 hrs",
    venue: "Arena Monterrey",
    image: "https://images.unsplash.com/photo-1692176548571-86138128e36c?w=1200",
    minPrice: 950,
    sections: [
      {
        id: "vip-6",
        name: "VIP Experiencia",
        description: "Meet & greet incluido",
        price: 2900,
        available: 35,
      },
      {
        id: "preferente-6",
        name: "Preferente Plus",
        description: "Asientos premium",
        price: 1700,
        available: 110,
      },
      {
        id: "general-6",
        name: "General",
        description: "De pie",
        price: 1100,
        available: 240,
      },
    ],
  },
  {
    id: "7",
    artist: "Maná",
    tour: "México Lindo y Querido Tour",
    date: "15 de Junio, 2025",
    time: "21:00 hrs",
    venue: "Estadio Tecnológico",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200",
    minPrice: 1200,
    sections: [
      {
        id: "vip-7",
        name: "VIP Platino",
        description: "Acceso VIP completo",
        price: 3200,
        available: 40,
      },
      {
        id: "preferente-7",
        name: "Preferente",
        description: "Zona premium",
        price: 1800,
        available: 150,
      },
      {
        id: "general-7",
        name: "General",
        description: "Acceso general",
        price: 1200,
        available: 500,
      },
    ],
  },
  {
    id: "8",
    artist: "Kinky",
    tour: "Nada de Nada Tour",
    date: "5 de Julio, 2025",
    time: "22:00 hrs",
    venue: "House of Blues",
    image: "https://images.unsplash.com/photo-1523198421516-973dc001a953?w=1200",
    minPrice: 800,
    sections: [
      {
        id: "vip-8",
        name: "VIP Lounge",
        description: "Área VIP con barra privada",
        price: 2400,
        available: 20,
      },
      {
        id: "preferente-8",
        name: "Preferente",
        description: "Mesa reservada",
        price: 1500,
        available: 60,
      },
      {
        id: "general-8",
        name: "General",
        description: "De pie",
        price: 1000,
        available: 150,
      },
    ],
  },
];

export default function HomePage() {
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const handleAddToCart = (items: CartItem[]) => {
    setCartItems((prev) => [...prev, ...items]);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    alert(
      "Funcionalidad de pago próximamente. Total: $" +
        (total * 1.16).toLocaleString() +
        " MXN",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a2c30] to-[#49484e]">
      <Header
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setShowCart(true)}
      />

      <main className="w-full py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <HeroCarousel
            concerts={concerts.slice(0, 4)}
            onSelectConcert={setSelectedConcert}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" id="eventos">
            <h1 className="text-white mb-4 text-4xl font-bold">Próximos Conciertos</h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Descubre los mejores eventos en vivo. Compra tus boletos de manera segura.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-white text-xl font-semibold mb-6 px-4">
            Eventos Destacados
          </h2>
          <ConcertCarousel
            concerts={concerts.slice(0, 4)}
            onSelectConcert={setSelectedConcert}
          />
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-white text-xl font-semibold mb-6 px-4">
            Más Eventos
          </h2>
          <ConcertCarousel
            concerts={concerts.slice(4, 8)}
            onSelectConcert={setSelectedConcert}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-[#c4a905]/20">
            <h2 className="text-white text-center mb-4 text-3xl font-bold">
              ¿Por qué comprar con Grupo Regia?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#c4a905] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#f9fbf6] text-2xl">✓</span>
                </div>
                <h4 className="text-white mb-2 font-semibold">Boletos Garantizados</h4>
                <p className="text-white/70">
                  Todos nuestros boletos son 100% auténticos
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#c4a905] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#f9fbf6] text-2xl">★</span>
                </div>
                <h4 className="text-white mb-2 font-semibold">Mejor Precio</h4>
                <p className="text-white/70">
                  Precios competitivos sin comisiones ocultas
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#c4a905] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#f9fbf6] text-2xl">♥</span>
                </div>
                <h4 className="text-white mb-2 font-semibold">Soporte 24/7</h4>
                <p className="text-white/70">
                  Estamos aquí para ayudarte
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
