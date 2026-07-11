// Logo oficial de Kelder (archivo en public/Kelder-logo.svg).
// Se dimensiona con la altura (className h-*) y ancho automático; object-contain
// preserva la proporción para que nunca se deforme dentro del header.
export function KelderLogo({ className }: { className?: string }) {
  return <img src="/Kelder-logo.svg" alt="Kelder" className={className} />
}
