import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import { getDb } from '../../../../lib/db';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { tipo, periodo, datos } = body;

    if (tipo === 'pdf') {
      return await exportarPDF(datos, periodo);
    } else if (tipo === 'excel') {
      return await exportarExcel(datos, periodo);
    }

    return NextResponse.json(
      { message: 'Tipo de exportación no válido' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error en exportación:', error);
    return NextResponse.json(
      { message: 'Error al exportar', error: error.message },
      { status: 500 }
    );
  }
}

async function exportarPDF(datos: any, periodo: string): Promise<Response> {
  return new Promise((resolve) => {
    const chunks: any[] = [];

    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(
        new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="reportes-jhaycorp-${periodo}.pdf"`,
          },
        })
      );
    });

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold');
    doc.text('📊 JHAYCORP LOGS', { align: 'center' });
    doc.fontSize(12).font('Helvetica');
    doc.text(`Reporte ${periodo}`, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, {
      align: 'center',
      fontSize: 10,
    });
    doc.moveDown();

    // Línea separadora
    doc.strokeColor('#cccccc').moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown();

    // Estadísticas principales
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('ESTADÍSTICAS PRINCIPALES', { underline: true });
    doc.moveDown(0.5);

    const stats = datos.estadisticas;
    doc.fontSize(11).font('Helvetica');

    const statsData = [
      [`Pedidos Totales:`, `${stats.total_pedidos}`],
      [`Ventas Totales:`, `$${(stats.total_ventas || 0).toFixed(2)}`],
      [`Promedio por Venta:`, `$${(stats.promedio_venta || 0).toFixed(2)}`],
      [`Error Rate:`, `${(stats.error_rate || 0).toFixed(2)}%`],
      [`API Performance:`, `${(stats.api_performance || 0).toFixed(2)}ms`],
      [`Uptime:`, `${stats.uptime}%`],
      [`Usuarios Activos:`, `${stats.usuarios_activos}`],
      [`CPU Promedio:`, `${(stats.cpu_promedio || 0).toFixed(2)}%`],
      [`Memoria Promedio:`, `${(stats.memoria_promedio || 0).toFixed(2)}%`],
    ];

    statsData.forEach(([label, value]) => {
      doc.text(`${label} ${value}`);
    });

    doc.moveDown();

    // Top Endpoints
    if (datos.top_endpoints?.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('TOP 5 ENDPOINTS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      doc.table({
        data: [
          ['Endpoint', 'Llamadas', 'Tiempo Promedio (ms)'],
          ...datos.top_endpoints.map((ep: any) => [
            ep.endpoint,
            ep.llamadas,
            (ep.tiempo_promedio || 0).toFixed(2),
          ]),
        ],
      });
      doc.moveDown();
    }

    // Errores Frecuentes
    if (datos.errores_frecuentes?.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('ERRORES FRECUENTES', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      doc.table({
        data: [
          ['Tipo de Error', 'Cantidad', 'Porcentaje'],
          ...datos.errores_frecuentes.map((err: any) => [
            err.tipo,
            err.cantidad,
            `${(err.porcentaje || 0).toFixed(2)}%`,
          ]),
        ],
      });
      doc.moveDown();
    }

    // Top Usuarios
    if (datos.actividad_usuarios?.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('TOP USUARIOS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      doc.table({
        data: [
          ['Usuario', 'Pedidos', 'Valor Total ($)'],
          ...datos.actividad_usuarios.map((usr: any) => [
            usr.usuario,
            usr.pedidos,
            (usr.valor_total || 0).toFixed(2),
          ]),
        ],
      });
    }

    // Pie
    doc.moveDown();
    doc.fontSize(9).fillColor('#999999');
    doc.text('© Jhaycorp Logs 2024 - Sistema Avanzado de Reportes', {
      align: 'center',
    });

    doc.end();
  });
}

async function exportarExcel(datos: any, periodo: string): Promise<Response> {
  // Crear workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumen
  const resumenData = [
    ['JHAYCORP LOGS - REPORTE ' + periodo.toUpperCase()],
    ['Generado:', new Date().toLocaleString('es-ES')],
    [],
    ['ESTADÍSTICAS PRINCIPALES'],
    ['Metric', 'Valor'],
    ['Pedidos Totales', datos.estadisticas.total_pedidos],
    ['Ventas Totales ($)', datos.estadisticas.total_ventas || 0],
    ['Promedio por Venta ($)', datos.estadisticas.promedio_venta || 0],
    ['Error Rate (%)', datos.estadisticas.error_rate || 0],
    ['API Performance (ms)', datos.estadisticas.api_performance || 0],
    ['Uptime (%)', datos.estadisticas.uptime],
    ['Usuarios Activos', datos.estadisticas.usuarios_activos],
    ['Transacciones Exitosas', datos.estadisticas.transacciones_exitosas],
    ['Transacciones Fallidas', datos.estadisticas.transacciones_fallidas],
    ['CPU Promedio (%)', datos.estadisticas.cpu_promedio || 0],
    ['Memoria Promedio (%)', datos.estadisticas.memoria_promedio || 0],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Sheet 2: Top Endpoints
  if (datos.top_endpoints?.length > 0) {
    const epData = [
      ['Endpoint', 'Llamadas', 'Tiempo Promedio (ms)'],
      ...datos.top_endpoints.map((ep: any) => [
        ep.endpoint,
        ep.llamadas,
        (ep.tiempo_promedio || 0).toFixed(2),
      ]),
    ];
    const wsEndpoints = XLSX.utils.aoa_to_sheet(epData);
    XLSX.utils.book_append_sheet(wb, wsEndpoints, 'Top Endpoints');
  }

  // Sheet 3: Errores
  if (datos.errores_frecuentes?.length > 0) {
    const errData = [
      ['Tipo de Error', 'Cantidad', 'Porcentaje (%)'],
      ...datos.errores_frecuentes.map((err: any) => [
        err.tipo,
        err.cantidad,
        (err.porcentaje || 0).toFixed(2),
      ]),
    ];
    const wsErrores = XLSX.utils.aoa_to_sheet(errData);
    XLSX.utils.book_append_sheet(wb, wsErrores, 'Errores');
  }

  // Sheet 4: Tendencias Diarias
  if (datos.tendencias_diarias?.length > 0) {
    const tendData = [
      ['Fecha', 'Pedidos', 'Ventas ($)', 'Errores'],
      ...datos.tendencias_diarias.map((t: any) => [
        t.fecha,
        t.pedidos,
        (t.ventas || 0).toFixed(2),
        t.errores || 0,
      ]),
    ];
    const wsTendencias = XLSX.utils.aoa_to_sheet(tendData);
    XLSX.utils.book_append_sheet(wb, wsTendencias, 'Tendencias Diarias');
  }

  // Sheet 5: Performance por Hora
  if (datos.performance_por_hora?.length > 0) {
    const perfData = [
      ['Hora', 'Respuesta (ms)', 'Errores'],
      ...datos.performance_por_hora.map((p: any) => [
        p.hora,
        (p.respuesta_ms || 0).toFixed(2),
        p.errores || 0,
      ]),
    ];
    const wsPerf = XLSX.utils.aoa_to_sheet(perfData);
    XLSX.utils.book_append_sheet(wb, wsPerf, 'Performance Hourly');
  }

  // Sheet 6: Usuarios
  if (datos.actividad_usuarios?.length > 0) {
    const usrData = [
      ['Usuario', 'Pedidos', 'Valor Total ($)'],
      ...datos.actividad_usuarios.map((usr: any) => [
        usr.usuario,
        usr.pedidos,
        (usr.valor_total || 0).toFixed(2),
      ]),
    ];
    const wsUsers = XLSX.utils.aoa_to_sheet(usrData);
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Actividad Usuarios');
  }

  // Generar buffer
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reportes-jhaycorp-${periodo}.xlsx"`,
    },
  });
}
