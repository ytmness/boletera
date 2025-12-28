# 🎫 Boletera Grupo Regia

Sistema de venta de boletos en línea para eventos y conciertos desarrollado con React, TypeScript y Vite.

## 🌟 Características

### 🎨 Interfaz de Usuario
- **Carrusel Hero**: Banner principal con eventos destacados en formato de flyers
- **Carruseles de Eventos**: Dos carruseles con autoplay infinito
- **Diseño Responsivo**: Adaptable a móviles, tablets y desktop
- **Tema Personalizado**: Colores corporativos de Grupo Regia (dorado #c4a905 y gris #49484e)

### 🎯 Funcionalidades
- Navegación intuitiva con menú superior (Eventos, Nosotros, Contacto, Mi Cuenta)
- Carruseles con autoplay que se detienen al hacer hover
- Selector de boletos por sección con diferentes precios
- Carrito de compras con contador de items
- Información detallada de cada evento (fecha, hora, venue, precio)

### 🎪 Eventos Incluidos
1. Los Tigres del Norte - Gira 2025
2. Café Tacvba - Un Viaje Tour
3. Molotov - Donde Jugarán Tour
4. Caifanes - El Diablito Tour
5. Zoé - Sonidos de Kármika Resonancia
6. Kinky - Nada de Nada Tour
7. Maná - México Lindo y Querido Tour
8. Reik - Ahora Tour
9. Intocable - Historia de Amor Tour
10. Mon Laferte - Autopoiética Tour
11. Panteón Rococó - La Carencia Tour
12. Natalia Lafourcade - De Todas las Flores Tour

## 🚀 Tecnologías

- **React 18.3.1** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS 4.1.12** - Estilos
- **Embla Carousel** - Carruseles
- **Lucide React** - Iconos
- **Radix UI** - Componentes de UI accesibles

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/ytmness/boletera.git

# Entrar al directorio
cd boletera

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
boletera/
├── public/
│   └── assets/
│       └── logo.png          # Logo de Grupo Regia
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Header.tsx           # Barra de navegación
│   │   │   ├── HeroCarousel.tsx     # Carrusel hero principal
│   │   │   ├── ConcertCarousel.tsx  # Carrusel de eventos
│   │   │   ├── ConcertCard.tsx      # Tarjeta de evento
│   │   │   ├── TicketSelector.tsx   # Selector de boletos
│   │   │   ├── Cart.tsx             # Carrito de compras
│   │   │   └── ui/                  # Componentes UI base
│   │   ├── types.ts                 # Tipos TypeScript
│   │   └── App.tsx                  # Componente principal
│   ├── styles/
│   │   └── index.css                # Estilos globales
│   └── main.tsx                     # Punto de entrada
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Paleta de Colores

- **Dorado Principal**: `#c4a905`
- **Dorado Hover**: `#d4b815`
- **Gris Oscuro**: `#49484e`
- **Gris Más Oscuro**: `#2a2c30`
- **Texto Claro**: `#f9fbf6`

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📝 Características Futuras

- [ ] Conexión a base de datos SQL
- [ ] Sistema de autenticación de usuarios
- [ ] Pasarela de pagos integrada
- [ ] Panel de administración
- [ ] Generación de boletos PDF/QR
- [ ] Historial de compras
- [ ] Notificaciones por email

## 👥 Autor

**Grupo Regia**

## 📄 Licencia

Este proyecto es privado y pertenece a Grupo Regia.

---

Desarrollado con ❤️ para Grupo Regia

