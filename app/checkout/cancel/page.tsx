"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleId = searchParams.get("saleId");

  return (
    <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
          <XCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold regia-text-title mb-4">
            Pago cancelado
          </h1>
          <p className="regia-text-body mb-6">
            Has cancelado el proceso de pago. No se realizó ningún cargo a tu tarjeta.
          </p>
          {saleId && (
            <p className="text-sm regia-text-body/70 mb-6">
              Tu reserva temporal ha sido liberada. Puedes iniciar una nueva compra cuando lo desees.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver atrás
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
