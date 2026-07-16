// ---------------------------------------------------------------------------
// Exportación de reportes a Excel (.xlsx) y PDF (.pdf).
// Las librerías (xlsx, jsPDF) se cargan de forma diferida (dynamic import) para
// no penalizar la carga inicial: solo se descargan cuando el usuario exporta.
// ---------------------------------------------------------------------------

export interface ExportColumn {
  /** Encabezado visible de la columna. */
  header: string
  /** Llave del campo dentro de cada fila. */
  key: string
}

export interface ExportOptions {
  /** Nombre base del archivo (sin extensión). */
  filename: string
  /** Título del reporte (encabezado del PDF / nombre de hoja). */
  title: string
  columns: ExportColumn[]
  rows: Record<string, string | number>[]
}

/** Marca de agua/etiqueta que acompaña a cada exportación. */
const BRAND = 'Kelder · Sistema de Devoluciones — Grupo Calzzapato'

/** Exporta los datos a un archivo Excel (.xlsx). */
export async function exportExcel({ filename, title, columns, rows }: ExportOptions) {
  const XLSX = await import('xlsx')
  const header = columns.map((c) => c.header)
  const body = rows.map((r) => columns.map((c) => r[c.key] ?? ''))
  const aoa = [[title], [BRAND], [], header, ...body]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  // Ancho de columnas aproximado según el contenido.
  ws['!cols'] = columns.map((c, i) => ({
    wch: Math.max(c.header.length, ...rows.map((r) => String(r[columns[i].key] ?? '').length)) + 2,
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName(title))
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/** Exporta los datos a un archivo PDF (.pdf) con tabla. */
export async function exportPDF({ filename, title, columns, rows }: ExportOptions) {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF({ orientation: columns.length > 5 ? 'landscape' : 'portrait' })

  doc.setFontSize(14)
  doc.setTextColor('#D32F2F')
  doc.text(title, 14, 16)
  doc.setFontSize(9)
  doc.setTextColor('#64748b')
  doc.text(`${BRAND}  ·  ${rows.length} registros`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => String(r[c.key] ?? ''))),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [211, 47, 47], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  })

  doc.save(`${filename}.pdf`)
}

/** Nombre de hoja Excel válido (máx. 31 chars, sin caracteres reservados). */
function sheetName(title: string): string {
  return title.replace(/[\\/?*[\]:]/g, '').slice(0, 31) || 'Reporte'
}
