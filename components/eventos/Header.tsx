import { ShoppingCart, Calendar, Info, Mail, User } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemsCount, onCartClick }: HeaderProps) {
  return (
    <header className="bg-[#49484e] border-b border-[#c4a905]/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-3">
          <Link href="/" className="flex items-center gap-3 h-full">
            <img src="/assets/logo.png" alt="Grupo Regia" className="h-full w-auto object-contain" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#eventos" className="flex items-center gap-2 text-[#f9fbf6] hover:text-[#c4a905] transition-colors text-base font-medium">
              <Calendar className="w-5 h-5" />
              <span>Eventos</span>
            </Link>
            <Link href="/#nosotros" className="flex items-center gap-2 text-[#f9fbf6] hover:text-[#c4a905] transition-colors text-base font-medium">
              <Info className="w-5 h-5" />
              <span>Nosotros</span>
            </Link>
            <Link href="/#contacto" className="flex items-center gap-2 text-[#f9fbf6] hover:text-[#c4a905] transition-colors text-base font-medium">
              <Mail className="w-5 h-5" />
              <span>Contacto</span>
            </Link>
            <Link href="/login" className="flex items-center gap-2 text-[#f9fbf6] hover:text-[#c4a905] transition-colors text-base font-medium">
              <User className="w-5 h-5" />
              <span>Mi Cuenta</span>
            </Link>
          </nav>

          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c4a905] text-[#f9fbf6] hover:bg-[#d4b815] transition-colors font-medium text-base"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Carrito</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#49484e] rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

