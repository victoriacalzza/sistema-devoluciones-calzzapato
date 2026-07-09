import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts'
import { FileSpreadsheet, FileText, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/AppLayout'
import { Card, SectionTitle, Button, Pill } from '../lib/ui'
import { byProveedor, byMarca, byType, byMotivo, topLotes, CHART_COLORS } from '../data/mock'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px -8px rgb(16 24 40 / 0.18)',
  fontSize: 12,
}

export default function Reports() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8">
      <PageHeader
        title="Reportes"
        subtitle="Dashboards interactivos y análisis de devoluciones"
        actions={
          <>
            <Button size="sm" variant="secondary" icon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}>Excel</Button>
            <Button size="sm" variant="secondary" icon={<FileText className="h-4 w-4 text-brand-600" />}>PDF</Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['Este mes', 'Trimestre', 'Año', 'Personalizado'].map((r, i) => (
          <Pill key={r} active={i === 0}>{r}</Pill>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Devoluciones por proveedor</SectionTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProveedor} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={44} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={28} name="Devoluciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle>Devoluciones por marca</SectionTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMarca} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#D32F2F" radius={[6, 6, 0, 0]} barSize={28} name="Devoluciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle>Distribución por tipo</SectionTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}>
                  {byType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle>Motivos más frecuentes</SectionTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMotivo} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} barSize={16} name="Casos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI panel */}
      <Card className="mt-4 border-brand-100 bg-brand-50/40">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white"><Sparkles className="h-5 w-5" /></span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900">Inteligencia del sistema · hallazgos</h4>
            <ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <li className="rounded-lg bg-white/70 px-3 py-2">⚠️ El lote <b className="font-mono">LT-NK-2291</b> supera el umbral de fallas (8.2%). Se recomienda alertar a Nike México.</li>
              <li className="rounded-lg bg-white/70 px-3 py-2">🔁 3 posibles devoluciones duplicadas detectadas en Culiacán Centro.</li>
              <li className="rounded-lg bg-white/70 px-3 py-2">📈 Proveedor Nike México con exceso de devoluciones vs. trimestre anterior.</li>
              <li className="rounded-lg bg-white/70 px-3 py-2">👟 Modelo Ultraboost Light con 6.1% de incidencia, por encima del promedio de marca.</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Lotes table */}
      <Card className="mt-4" padded={false}>
        <div className="px-5 py-4"><h3 className="text-sm font-semibold text-slate-900">Lotes con mayor incidencia</h3></div>
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-5 py-2.5">Lote</th>
                <th className="px-5 py-2.5">Marca</th>
                <th className="px-5 py-2.5">Proveedor</th>
                <th className="px-5 py-2.5 text-right">Incidencias</th>
                <th className="px-5 py-2.5 text-right">Tasa de falla</th>
              </tr>
            </thead>
            <tbody>
              {topLotes.map((l) => (
                <tr key={l.lote} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs font-medium text-slate-900">{l.lote}</td>
                  <td className="px-5 py-3 text-slate-600">{l.marca}</td>
                  <td className="px-5 py-3 text-slate-500">{l.proveedor}</td>
                  <td className="px-5 py-3 text-right font-medium text-slate-900">{l.incidencias}</td>
                  <td className="px-5 py-3 text-right"><span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">{l.tasa}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
