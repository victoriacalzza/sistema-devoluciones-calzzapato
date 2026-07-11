import { createContext, useContext, useState, type ReactNode } from 'react'
import { personByRole, ADMIN_USER, type Person, type RoleKey } from '../data/mock'

interface RoleCtx {
  user: Person
  role: RoleKey
  /** Subrol Administrador (dentro de Compras). */
  admin: boolean
  setPersona: (p: Person) => void
  setRole: (r: RoleKey) => void
}

const Ctx = createContext<RoleCtx | null>(null)

/** Persona inicial: `?role=tienda|ecommerce|compras|admin` en la URL o Compras por defecto. */
function initialPersona(): Person {
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('role')
    if (q === 'tienda' || q === 'ecommerce' || q === 'compras') return personByRole(q)
    if (q === 'admin') return ADMIN_USER
  }
  return personByRole('compras')
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Person>(initialPersona)
  const value: RoleCtx = {
    user,
    role: user.roleKey,
    admin: !!user.admin,
    setPersona: setUser,
    setRole: (r) => setUser(personByRole(r)),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useRole(): RoleCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
