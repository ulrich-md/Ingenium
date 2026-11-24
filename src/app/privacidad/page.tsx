import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aviso de privacidad · Kwanta" };

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Privacidad() {
  return (
    <div className="wrap diag" style={{ maxWidth: 760 }}>
      <p className="eyebrow">Aviso de privacidad simplificado</p>
      <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.4rem)" }}>Cómo usamos tus datos</h1>
      <div className="prose-legal">
        <p><b>Quién es responsable.</b> Kwanta, proyecto educativo de Física IB en español, con domicilio en México, es responsable de los datos que nos compartes.</p>
        <p><b>Qué datos pedimos.</b> Nombre, correo, WhatsApp (opcional), colegio, país, nivel y el resultado de tu diagnóstico (nota proyectada y porcentaje por unidad). No pedimos datos sensibles ni datos de pago: los pagos los procesa Mercado Pago.</p>
        <p><b>Para qué los usamos.</b> Para enviarte tu resultado y tu plan de estudio, avisarte de la preventa y las cohortes de Kwanta, y mejorar las preguntas del diagnóstico con estadísticas generales.</p>
        <p><b>Con quién los compartimos.</b> Con nadie para fines comerciales. Se guardan en una hoja de cálculo de Google a la que solo tiene acceso el equipo de Kwanta.</p>
        <p><b>Menores de edad.</b> Si eres menor de edad, necesitas permiso de tu madre, padre o tutor para enviarnos tus datos.</p>
        <p><b>Tus derechos.</b> Puedes pedir acceder a tus datos, corregirlos, borrarlos u oponerte a su uso (derechos ARCO), o dejar de recibir mensajes, escribiendo a {CONTACT ? <a href={`mailto:${CONTACT}`}>{CONTACT}</a> : "nuestro correo de contacto"}.</p>
        <p className="muted">Este aviso puede actualizarse. Última actualización: noviembre de 2026.</p>
      </div>
    </div>
  );
}
