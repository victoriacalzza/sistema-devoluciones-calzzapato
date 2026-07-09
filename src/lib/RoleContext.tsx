import { createContext, useContext, useState, type ReactNode } from 'react'
import { personByRole, type Person, type RoleKey } from '../data/mock'

interface RoleCtx {
  user: Person
  role: RoleKey
  setRole: (r: RoleKey) => void
}

const Ctx = createContext<RoleCtx | null>(null)

/** Rol inicial: `?role=tienda|compras` en la URL (útil para storyboards/demo) o Compras por defecto. */
function initialRole(): RoleKey {
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('role')
    if (q === 'tienda' || q === 'compras') return q
  }
  return 'compras'
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleKey>(initialRole)
  const user = personByRole(role)
  return <Ctx.Provider value={{ user, role, setRole }}>{children}</Ctx.Provider>
}

export function useRole(): RoleCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
