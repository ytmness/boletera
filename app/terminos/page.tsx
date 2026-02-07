"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="min-h-screen regia-bg-main">
      {/* Header */}
      <header className="regia-bg-black border-b border-regia-gold-old/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-regia-cream/80 hover:text-regia-gold-bright transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Navegación interna */}
        <nav className="flex flex-wrap gap-3">
          <a
            href="#terminos"
            className="px-4 py-2 rounded-lg bg-regia-gold-old/20 text-regia-cream hover:bg-regia-gold-old/30 transition-colors text-sm font-medium"
          >
            Términos y Condiciones
          </a>
          <a
            href="#reembolsos"
            className="px-4 py-2 rounded-lg bg-regia-gold-old/20 text-regia-cream hover:bg-regia-gold-old/30 transition-colors text-sm font-medium"
          >
            Política de Reembolsos
          </a>
          <a
            href="#faq"
            className="px-4 py-2 rounded-lg bg-regia-gold-old/20 text-regia-cream hover:bg-regia-gold-old/30 transition-colors text-sm font-medium"
          >
            Preguntas Frecuentes
          </a>
        </nav>

        {/* TÉRMINOS Y CONDICIONES */}
        <section id="terminos" className="scroll-mt-24">
          <h1 className="regia-title-main text-2xl md:text-3xl mb-4 text-regia-gold-bright">
            TÉRMINOS Y CONDICIONES DE USO Y COMPRA
          </h1>
          <p className="text-regia-cream/70 text-sm mb-8">
            Última actualización: 14 de enero de 2026
          </p>

          <div className="prose prose-invert prose-regia space-y-6 text-regia-cream/90 text-sm leading-relaxed">
            <p>
              El presente documento establece los Términos y Condiciones que regulan el acceso, uso y compra de productos y servicios ofrecidos a través de este sitio web (en lo sucesivo, el &quot;Sitio&quot;).
            </p>
            <p>
              Al acceder, navegar o realizar una compra en el Sitio, el usuario acepta expresa e íntegramente los presentes Términos y Condiciones. En caso de no estar de acuerdo, deberá abstenerse de utilizar el Sitio.
            </p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">1. OBJETO DEL SITIO</h2>
            <p>El Sitio tiene como finalidad:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Informar sobre eventos, espectáculos y experiencias en vivo</li>
              <li>Comercializar boletos, accesos y servicios relacionados</li>
              <li>Gestionar boletos digitales y validación de accesos</li>
              <li>Proporcionar información operativa y atención al cliente</li>
            </ul>
            <p>El operador del Sitio se reserva el derecho de modificar, suspender o eliminar eventos, contenidos o servicios sin previo aviso.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">2. CONDICIONES DE USO</h2>
            <p>El usuario se obliga a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar información veraz, completa y actualizada</li>
              <li>Utilizar el Sitio únicamente para fines lícitos</li>
              <li>No intentar vulnerar la seguridad, estabilidad o funcionamiento del Sitio</li>
              <li>No reproducir, copiar o explotar el contenido sin autorización</li>
            </ul>
            <p>El uso indebido del Sitio podrá derivar en la suspensión del acceso, sin responsabilidad para el operador.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">3. PROCESO DE COMPRA</h2>
            <h3 className="font-semibold text-regia-gold-old mt-4 mb-2">3.1 Compra de boletos</h3>
            <p>Al realizar una compra:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario selecciona el evento, tipo de boleto y cantidad</li>
              <li>Realiza el pago a través de plataformas de pago de terceros</li>
              <li>Recibe la confirmación y su(s) boleto(s) digital(es) con código QR</li>
            </ul>
            <p>La compra se considera finalizada y confirmada una vez aprobado el pago.</p>
            <h3 className="font-semibold text-regia-gold-old mt-4 mb-2">3.2 Boletos digitales</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los boletos son únicos, personales y no duplicables</li>
              <li>Cada boleto cuenta con un código QR válido para un solo acceso</li>
              <li>Una vez escaneado el QR, el boleto se considera utilizado</li>
            </ul>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">4. ACCESO AL EVENTO</h2>
            <h3 className="font-semibold text-regia-gold-old mt-4 mb-2">4.1 Validación</h3>
            <p>El acceso está sujeto a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Presentación del boleto digital legible</li>
              <li>Validación correcta del código QR</li>
              <li>Cumplimiento de los filtros de seguridad del recinto</li>
            </ul>
            <h3 className="font-semibold text-regia-gold-old mt-4 mb-2">4.2 Reingreso</h3>
            <p>Salvo indicación expresa en contrario: No se permite el reingreso una vez validado el acceso. El usuario acepta que al salir del recinto pierde su derecho de acceso.</p>
            <h3 className="font-semibold text-regia-gold-old mt-4 mb-2">4.3 Derecho de admisión</h3>
            <p>Se reserva el derecho de admisión en caso de: conductas violentas, agresivas o riesgosas; estado inconveniente; incumplimiento de normas del evento o del recinto. En estos supuestos no habrá reembolso.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">5. TRANSFERENCIA, REVENTA Y USO INDEBIDO</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>El usuario es responsable del uso y resguardo de su boleto</li>
              <li>No se garantiza la validez de boletos adquiridos fuera de canales oficiales</li>
              <li>En caso de duplicidad, el primer QR escaneado será el válido</li>
              <li>La detección de reventa no autorizada podrá derivar en la cancelación del boleto</li>
            </ul>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">6. PRECIOS, CARGOS Y FACTURACIÓN</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Los precios se expresan en pesos mexicanos (MXN)</li>
              <li>Los cargos incluyen impuestos aplicables, salvo indicación contraria</li>
              <li>La facturación deberá solicitarse conforme a los plazos y requisitos publicados</li>
              <li>No se corrigen errores derivados de datos fiscales proporcionados incorrectamente por el usuario</li>
            </ul>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">7. CONTRACARGOS, FRAUDE Y MEDIDAS DE SEGURIDAD</h2>
            <p>En caso de contracargos, intentos de fraude o uso indebido: se podrán cancelar los boletos relacionados; se podrán bloquear accesos asociados; el usuario acepta colaborar en procesos de verificación. El uso fraudulento del Sitio podrá ser denunciado ante autoridades competentes.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">8. MODIFICACIÓN, REPROGRAMACIÓN O CANCELACIÓN DEL EVENTO</h2>
            <h3 className="font-semibold text-regia-gold-old mt-4 mb-2">8.1 Reprogramación</h3>
            <p>En caso de reprogramación: el boleto será válido para la nueva fecha. No procederán reembolsos por cambio de fecha.</p>
            <h3 className="font-semibold text-regia-gold-old mt-4 mb-2">8.2 Cancelación definitiva</h3>
            <p>En caso de cancelación definitiva: se informará el procedimiento aplicable por los medios oficiales. La responsabilidad se limitará conforme a la legislación vigente y comunicados oficiales.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">9. CASO FORTUITO Y FUERZA MAYOR</h2>
            <p>No existirá responsabilidad por incumplimientos derivados de causas ajenas al control del operador, incluyendo: disposiciones gubernamentales, fenómenos naturales, fallas técnicas de terceros, situaciones de seguridad o salud pública. El usuario acepta las medidas operativas que se determinen en dichos supuestos.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">10. RESPONSABILIDAD DEL USUARIO</h2>
            <p>El usuario asume la responsabilidad por: su conducta dentro del evento; daños ocasionados a terceros o al inmueble; objetos personales. No se responde por pérdidas, robos o daños personales dentro del evento, salvo disposición legal en contrario.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">11. PROPIEDAD INTELECTUAL</h2>
            <p>Todos los contenidos del Sitio son propiedad de sus respectivos titulares. Queda prohibida su reproducción total o parcial sin autorización previa y por escrito.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">12. MODIFICACIONES A LOS TÉRMINOS</h2>
            <p>Estos Términos podrán modificarse en cualquier momento. Las modificaciones surtirán efectos desde su publicación en el Sitio.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">13. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</h2>
            <p>Los presentes Términos se rigen por las leyes de los Estados Unidos Mexicanos. Las partes se someten a la jurisdicción de los tribunales competentes del Estado de Morelos, renunciando a cualquier otro fuero.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">14. ACEPTACIÓN</h2>
            <p>El uso del Sitio y/o la realización de una compra implican la aceptación expresa de los presentes Términos y Condiciones.</p>
          </div>
        </section>

        {/* POLÍTICA DE REEMBOLSOS */}
        <section id="reembolsos" className="scroll-mt-24 pt-16 border-t border-regia-gold-old/20">
          <h1 className="regia-title-main text-2xl md:text-3xl mb-4 text-regia-gold-bright">
            POLÍTICA DE REEMBOLSOS
          </h1>
          <p className="text-regia-cream/70 text-sm mb-8">
            Última actualización: 14 de enero de 2026
          </p>

          <div className="prose prose-invert prose-regia space-y-6 text-regia-cream/90 text-sm leading-relaxed">
            <p>La presente Política de Reembolsos regula las condiciones aplicables a la compra de boletos, accesos y servicios ofrecidos a través de este sitio web. Al realizar una compra, el usuario reconoce haber leído y aceptado expresamente esta política.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">1. COMPRAS DEFINITIVAS</h2>
            <p>Todas las compras realizadas a través del sitio web son finales, firmes y no reembolsables. No procederán reembolsos en los siguientes supuestos, incluyendo pero no limitándose a: cambio de opinión del usuario; imposibilidad personal de asistir al evento; errores del usuario al seleccionar el evento, fecha, horario, tipo de boleto o cantidad; falta de lectura de la información del evento; no utilización del boleto.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">2. BOLETOS DIGITALES</h2>
            <p>Una vez emitido el boleto digital: se considera entregado correctamente; no es posible su cancelación, sustitución ni devolución; el usuario es responsable del resguardo y uso del código QR. La pérdida, eliminación o uso indebido del boleto no genera derecho a reembolso.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">3. REPROGRAMACIÓN DEL EVENTO</h2>
            <p>En caso de que el evento sea reprogramado por cualquier causa: los boletos adquiridos serán válidos automáticamente para la nueva fecha; no se otorgarán reembolsos por cambio de fecha; el usuario acepta la reprogramación como solución suficiente.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">4. CANCELACIÓN DEFINITIVA DEL EVENTO</h2>
            <p>En caso de cancelación definitiva del evento: se informará al público el procedimiento aplicable a través de los canales oficiales; el alcance de cualquier reembolso o compensación se limitará a lo establecido en dicho comunicado; la empresa no estará obligada a cubrir gastos adicionales del usuario, tales como transporte, hospedaje u otros gastos indirectos.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">5. CASO FORTUITO Y FUERZA MAYOR</h2>
            <p>No procederán reembolsos cuando la cancelación, suspensión o modificación del evento derive de causas ajenas al control del organizador, incluyendo: actos de autoridad; disposiciones gubernamentales; fenómenos naturales; situaciones de seguridad; emergencias sanitarias; fallas técnicas de terceros. En dichos casos, el usuario acepta las medidas alternativas que se determinen, sin derecho a reembolso adicional.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">6. CONTRACARGOS Y FRAUDE</h2>
            <p>En caso de contracargos, intentos de fraude o uso indebido: se podrán cancelar los boletos relacionados; se podrán bloquear accesos al evento; se ejercerán las acciones legales correspondientes. El contracargo injustificado no obliga a la empresa a realizar reembolso alguno.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">7. EXCLUSIONES EXPRESAS</h2>
            <p>No habrá reembolso por: derecho de admisión negado por conducta indebida; expulsión del evento por incumplimiento de normas; reventa no autorizada; duplicidad de códigos QR.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">8. MEDIO DE CONTACTO</h2>
            <p>Cualquier duda relacionada con esta política deberá canalizarse exclusivamente a través de los medios oficiales de contacto publicados en el sitio web.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">9. MODIFICACIONES A LA POLÍTICA</h2>
            <p>La presente Política de Reembolsos podrá ser modificada en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en el sitio web.</p>

            <h2 className="regia-title-secondary text-lg mt-8 mb-3">10. ACEPTACIÓN</h2>
            <p>La realización de una compra implica la aceptación expresa, total e irrevocable de la presente Política de Reembolsos.</p>
          </div>
        </section>

        {/* PREGUNTAS FRECUENTES */}
        <section id="faq" className="scroll-mt-24 pt-16 border-t border-regia-gold-old/20">
          <h1 className="regia-title-main text-2xl md:text-3xl mb-4 text-regia-gold-bright">
            PREGUNTAS FRECUENTES (FAQ)
          </h1>
          <p className="text-regia-cream/70 text-sm mb-8">
            Última actualización: 14 de enero de 2026
          </p>

          <div className="space-y-6 text-regia-cream/90 text-sm leading-relaxed">
            <FaqItem
              q="1. ¿Cómo y cuándo recibiré mis boletos?"
              a="Los boletos se entregan en formato digital vía correo electrónico. La entrega se realizará hasta un máximo de 7 (siete) días naturales antes de la fecha del evento, independientemente de la fecha en que se haya realizado la compra. Esta modalidad permite validar accesos, prevenir fraudes y garantizar una mejor operación del evento."
            />
            <FaqItem
              q="2. ¿Por qué no recibo mi boleto inmediatamente después de comprar?"
              a="La entrega no es inmediata por razones operativas y de seguridad. Los boletos se envían de forma programada, una vez que: el evento se encuentra confirmado; se han validado pagos y transacciones; se habilitan los accesos definitivos. Esto no afecta la validez de tu compra, siempre que hayas recibido tu confirmación de pago."
            />
            <FaqItem
              q="3. ¿Qué recibo después de pagar si aún no me envían el boleto?"
              a="Al completar tu compra recibirás un correo de confirmación, el cual acredita que tu pago fue procesado correctamente. Ese correo sirve como comprobante de compra hasta que se envíen los boletos digitales."
            />
            <FaqItem
              q="4. ¿Qué pasa si no recibo mi boleto dentro del plazo indicado?"
              a="Si faltan menos de 7 días para el evento y no has recibido tu boleto: revisa tu carpeta de spam o correo no deseado; verifica que el correo ingresado sea correcto; contacta a soporte a través de los medios oficiales. Ten a la mano tu comprobante de compra para una atención más rápida."
            />
            <FaqItem
              q="5. ¿Los boletos son físicos o digitales?"
              a="Todos los boletos son 100% digitales. No se entregan boletos físicos bajo ninguna circunstancia."
            />
            <FaqItem
              q="6. ¿Puedo imprimir mi boleto?"
              a="Sí. Puedes imprimirlo o presentarlo desde tu celular. Es indispensable que el código QR sea legible al momento del acceso."
            />
            <FaqItem
              q="7. ¿Puedo transferir mi boleto a otra persona?"
              a="Sí. El boleto puede ser utilizado por cualquier persona que lo presente, siempre que: el código QR no haya sido utilizado previamente; no exista duplicidad o bloqueo por uso indebido. La empresa no se hace responsable por transferencias entre particulares."
            />
            <FaqItem
              q="8. ¿Qué pasa si alguien más usa mi código QR?"
              a="En caso de duplicidad: el primer código QR escaneado será el válido; los accesos posteriores serán rechazados; no habrá reposición ni reembolso en estos casos."
            />
            <FaqItem
              q="9. ¿Puedo salir y volver a entrar al evento?"
              a="Salvo que se indique expresamente lo contrario: no se permite el reingreso; una vez validado el acceso y salido del recinto, se pierde el derecho de entrada."
            />
            <FaqItem
              q="10. ¿Puedo pedir reembolso si no puedo asistir?"
              a="No. Todas las compras son finales y no reembolsables, incluso si no puedes asistir por causas personales. Te recomendamos revisar la Política de Reembolsos antes de comprar."
            />
            <FaqItem
              q="11. ¿Qué pasa si el evento se reprograma?"
              a="En caso de reprogramación: tu boleto será válido para la nueva fecha; no se realizan reembolsos por cambio de fecha."
            />
            <FaqItem
              q="12. ¿Qué pasa si el evento se cancela?"
              a="En caso de cancelación definitiva: se informará el procedimiento aplicable por los canales oficiales; cualquier medida se limitará estrictamente a lo comunicado."
            />
            <FaqItem
              q="13. ¿Se emiten facturas por la compra?"
              a="No. No se emiten facturas por la compra de boletos o accesos. Al realizar la compra, el usuario acepta expresamente esta condición."
            />
            <FaqItem
              q="14. ¿Qué métodos de pago aceptan?"
              a="Los métodos de pago disponibles se muestran durante el proceso de compra y son procesados por plataformas de pago de terceros. La empresa no almacena información bancaria."
            />
            <FaqItem
              q="15. ¿Pueden negarme el acceso al evento?"
              a="Sí. Se reserva el derecho de admisión en caso de: conducta agresiva o inapropiada; incumplimiento de reglas del evento o del recinto; estado inconveniente. En estos casos no habrá reembolso."
            />
            <FaqItem
              q="16. ¿La empresa se hace responsable por objetos perdidos?"
              a="No. Cada asistente es responsable de sus objetos personales. No se responde por pérdidas, robos o daños dentro del evento."
            />
            <FaqItem
              q="17. ¿Dónde puedo consultar información legal?"
              a="Toda la información legal se encuentra disponible en el sitio web: Aviso de Privacidad, Términos y Condiciones, Política de Reembolsos."
            />
            <FaqItem
              q="18. ¿Dónde puedo pedir soporte?"
              a="Para cualquier duda o aclaración, utiliza únicamente los medios oficiales de contacto publicados en el sitio web."
            />
          </div>
        </section>

        {/* Volver arriba */}
        <div className="pt-12 text-center">
          <a
            href="#terminos"
            className="inline-flex items-center gap-2 text-regia-gold-old hover:text-regia-gold-bright transition-colors text-sm"
          >
            ↑ Volver arriba
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="regia-footer mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="regia-footer-text">
            © {new Date().getFullYear()} Grupo Regia. Todos los derechos reservados.
          </p>
          <Link href="/" className="text-regia-gold-old hover:text-regia-gold-bright text-sm mt-4 inline-block">
            Volver al inicio
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-regia-gold-old/10 pb-4">
      <h3 className="font-semibold text-regia-gold-old mb-2">{q}</h3>
      <p className="text-regia-cream/90">{a}</p>
    </div>
  );
}
