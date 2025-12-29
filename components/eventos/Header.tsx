import { ShoppingCart, Calendar, Info, Mail, User } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemsCount, onCartClick }: HeaderProps) {
  return (
    <header className="bg-[#49484e] border-b border-[#c4a905]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-36 py-4">
          <Link href="/" className="flex items-center gap-3 h-full">
            <img src="/assets/logo.png" alt="Grupo Regia" className="h-full w-auto object-contain" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#eventos" className="flex items-center gap-2 text-[#f9fbf6] hover:text-[#c4a905] transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Eventos</span>
            </Link>
            <Link href="/#nosotros" className="flex items-center gap-2 text-[#f9fbf6] hover:text-[#c4a905] transition-colors">
              <Info className="w-4 h-4" />
              <span>Nosotros</span>
            </Link>
            <Link href="/#contacto" className="flex items-center gap-2 text-[#f9fbf6] hover:text-[#c4a905] transition-colors">
              <Mail className="w-4 h-4" />
              <span>Contacto</span>
            </Link>
            <Link href="/login" className="flex items-center gap-2 text-[#f9fbf6] hover:text-[#c4a905] transition-colors">
              <User className="w-4 h-4" />
              <span>Mi Cuenta</span>
            </Link>
          </nav>

          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c4a905] text-[#f9fbf6] hover:bg-[#d4b815] transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Carrito</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#49484e] rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

