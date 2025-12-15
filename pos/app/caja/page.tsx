'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, CheckCircle, Clock, AlertCircle, Printer, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { API, PAGES, IMAGES, ESTADOS } from '@/lib/config';
import { imprimirEnTérmica, imprimirViaBrowser } from '@/lib/thermal-printer';
import PedidoDeleteDetailModal from '@/components/caja/PedidoDeleteDetailModal';
import PedidoEditCompleteModal from '@/components/caja/PedidoEditCompleteModal';
import ModificacionDetalleModal from '@/components/caja/ModificacionDetalleModal';
import NotificacionesStack, { Notificacion } from '@/components/NotificacionesStack';

interface PedidoCuenta {
  id: number;
  numero_pedido: string;
  es_para_llevar: number;
  estado: string;
  total: number;
  subtotal?: number;
  total_descuento?: number;
  descuentos_json?: string;
  creado_en: string;
  descuentosAplicados?: Array<{
    promocionId: number;
    promocionNombre: string;
    descuentoTotal: number;
    cantidadItems: number;
    precioItemGratis: number;
  }>;
  items?: { 
    nombre: string
    cantidad: number
    precio_unitario: number
    descuento?: number
    notas?: string
    especificaciones?: string
  }[];
}

interface CuentaCaja {
  id: number;
  numero_cuenta: string;
  mesa_numero?: string;
  mesero_nombre: string;
  total: number;
  total_pedidos: number;
  estado: string;
  pedidos?: PedidoCuenta[];
}

interface ModificacionPendiente {
  id: number;
  tipo: string;
  pedido_id: number;
  cuenta_id: number;
  solicitado_por: string;
  detalles: string;
  cambios: string;
  estado: string;
  fecha_solicitud: string;
  pedido_numero: string;
  cuenta_numero: string;
  mesa_numero?: string;
  mesero_nombre: string;
}

export default function CajaPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [cuentasAbiertas, setCuentasAbiertas] = useState<CuentaCaja[]>([]);
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState<CuentaCaja[]>([]);
  const [modificacionesPendientes, setModificacionesPendientes] = useState<ModificacionPendiente[]>([]);
  const [activeTab, setActiveTab] = useState<'abiertas' | 'cerradas' | 'modificaciones'>('cerradas');
  const [loading, setLoading] = useState(false);
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaCaja | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [pedidoAEditar, setPedidoAEditar] = useState<PedidoCuenta | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pedidoAEliminar, setPedidoAEliminar] = useState<PedidoCuenta | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [showModificacionModal, setShowModificacionModal] = useState(false);
  const [modificacionSeleccionada, setModificacionSeleccionada] = useState<ModificacionPendiente | null>(null);
  const [procesandoModificacion, setProcesandoModificacion] = useState(false);

  // Notificaciones
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [ultimaModificacion, setUltimaModificacion] = useState<number>(0);

  const CAJA_PIN = '7933';

  const handlePinSubmit = () => {
    if (pinInput === CAJA_PIN) {
      setIsAuthenticated(true);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('PIN incorrecto');
      setPinInput('');
    }
  };

  const fetchData = async () => {
    try {
      const abiertasRes = await fetch(`${API.CUENTAS}?estado=${ESTADOS.CUENTA.ABIERTA}`);
      if (abiertasRes.ok) {
        const response = await abiertasRes.json();
        const data = response.data || response;
        setCuentasAbiertas(Array.isArray(data) ? data : []);
      }
      
      const cerradasRes = await fetch(`${API.CUENTAS}?estado=${ESTADOS.CUENTA.CERRADA}`);
      if (cerradasRes.ok) {
        const response = await cerradasRes.json();
        const data = response.data || response;
        setCuentasPorCobrar(Array.isArray(data) ? data : []);
      }

      const modificacionesRes = await fetch(`${API.MODIFICACIONES}?estado=pendiente`);
      if (modificacionesRes.ok) {
        const response = await modificacionesRes.json();
        const data = response.data || response;
        setModificacionesPendientes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetalleCuenta = async (cuenta: CuentaCaja) => {
    setLoadingDetalle(true);
    try {
      const response = await fetch(API.CUENTA_BY_ID(cuenta.id));
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setSelectedCuenta(data);
        setTotalAmount(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching cuenta detalle:', error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleEditarPedido = (pedido: PedidoCuenta) => {
    setPedidoAEditar(pedido);
    setShowEditarModal(true);
  };

  const handleEliminarPedido = (pedido: PedidoCuenta) => {
    setPedidoAEliminar(pedido);
    setShowDeleteModal(true);
  };

  const confirmarEliminarPedido = async () => {
    if (!pedidoAEliminar || !selectedCuenta) return;

    setEliminando(true);
    try {
      const response = await fetch(API.MODIFICACIONES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'eliminacion',
          pedido_id: pedidoAEliminar.id,
          cuenta_id: selectedCuenta.id,
          solicitado_por: 'Caja',
          detalles: `Solicitud de eliminación del pedido ${pedidoAEliminar.numero_pedido}`,
        })
      });

      if (response.ok) {
        setSuccessMessage('✅ Petición de eliminación enviada');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          fetchData();
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la petición');
    } finally {
      setEliminando(false);
      setShowDeleteModal(false);
      setPedidoAEliminar(null);
    }
  };

  const handleGuardarEdicion = async (editedData: any) => {
    if (!pedidoAEditar) return;

    try {
      // Actualizar directamente en la BD via API
      const response = await fetch(`${API.PEDIDOS}/${pedidoAEditar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: editedData.items,
          observaciones: editedData.observaciones
        })
      });

      if (response.ok) {
        setSuccessMessage('✅ Pedido actualizado correctamente');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowEditarModal(false);
          setPedidoAEditar(null);
          fetchData();
        }, 2000);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'No se pudo actualizar el pedido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el pedido');
    }
  };

  const handleAprobarModificacion = async () => {
    if (!modificacionSeleccionada) return;

    setProcesandoModificacion(true);
    try {
      const response = await fetch(`${API.MODIFICACIONES}/${modificacionSeleccionada.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'aprobada' })
      });

      if (response.ok) {
        setSuccessMessage('✅ Modificación aprobada');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowModificacionModal(false);
          setModificacionSeleccionada(null);
          fetchData();
        }, 2000);
      } else {
        alert('Error al aprobar la modificación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la aprobación');
    } finally {
      setProcesandoModificacion(false);
    }
  };

  const handleRechazarModificacion = async () => {
    if (!modificacionSeleccionada) return;

    setProcesandoModificacion(true);
    try {
      const response = await fetch(`${API.MODIFICACIONES}/${modificacionSeleccionada.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'rechazada' })
      });

      if (response.ok) {
        setSuccessMessage('✅ Modificación rechazada');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowModificacionModal(false);
          setModificacionSeleccionada(null);
          fetchData();
        }, 2000);
      } else {
        alert('Error al rechazar la modificación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el rechazo');
    } finally {
      setProcesandoModificacion(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Notificaciones de nuevas modificaciones
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkModificaciones = async () => {
      try {
        const response = await fetch(`${API.MODIFICACIONES}?estado=pendiente`);
        if (response.ok) {
          const modificaciones = await response.json() as any[];
          
          // Filtrar solo las nuevas modificaciones
          modificaciones.forEach(mod => {
            if (mod.id > ultimaModificacion && mod.tipo === 'edicion_completa') {
              const id = `notif-mod-${mod.id}`;
              if (!notificaciones.find(n => n.id === id)) {
                addNotificacion({
                  id,
                  tipo: 'info',
                  titulo: '📝 Nueva Modificación',
                  mensaje: `${mod.mesero_nombre} solicita cambios en ${mod.pedido_numero} (Cuenta ${mod.cuenta_numero})`,
                  duracion: 0, // Manual dismiss
                });
              }
              setUltimaModificacion(Math.max(ultimaModificacion, mod.id));
            }
          });
        }
      } catch (error) {
        console.error('Error checking new modificaciones:', error);
      }
    };

    const interval = setInterval(checkModificaciones, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, ultimaModificacion, notificaciones]);

  const addNotificacion = (notif: Notificacion) => {
    setNotificaciones(prev => [...prev, notif]);
  };

  const dismissNotificacion = (id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  const handleCobrarCuenta = async () => {
    if (!selectedCuenta || totalAmount <= 0 || !paymentMethod) return;

    try {
      const response = await fetch(API.CUENTA_BY_ID(selectedCuenta.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estado: ESTADOS.CUENTA.COBRADA,
          metodo_pago: paymentMethod,
          total_cobrado: totalAmount
        })
      });

      if (response.ok) {
        const mensaje = paymentMethod === 'cash'
          ? `✓ Cuenta Cobrada\n💰 Efectivo: $${totalAmount.toFixed(2)}`
          : `✓ Cuenta Cobrada\n💳 Tarjeta: $${totalAmount.toFixed(2)}`;

        setSuccessMessage(mensaje);
        setShowSuccess(true);

        setTimeout(() => {
          setSelectedCuenta(null);
          setShowPayment(false);
          setPaymentMethod(null);
          setTotalAmount(0);
          setShowSuccess(false);
          fetchData();
        }, 2000);
      }
    } catch (error) {
      console.error('Error cobrando cuenta:', error);
      alert('Error al cobrar cuenta');
    }
  };

  const handleImprimirTicket = async () => {
    if (!selectedCuenta) return;

    try {
      // Obtener fecha y hora actual
      const now = new Date();
      const fecha = now.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const hora = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Preparar datos del ticket
      const ticketData = {
        numeroTicket: `${selectedCuenta.numero_cuenta}`,
        nombreNegocio: 'MAZUHI',
        mesa: selectedCuenta.mesa_numero ? `${selectedCuenta.mesa_numero}` : undefined,
        mesero: selectedCuenta.mesero_nombre,
        items: (selectedCuenta.pedidos || []).flatMap((pedido: any) =>
          (pedido.items || []).map((item: any) => ({
            nombre: item.nombre || 'Producto',
            cantidad: item.cantidad || 1,
            precio_unitario: item.precio_unitario || 0,
            subtotal: (item.cantidad || 1) * (item.precio_unitario || 0),
            notas: item.notas || ''
          }))
        ),
        subtotal: selectedCuenta.total || 0,
        total: selectedCuenta.total || 0,
        fecha: fecha,
        hora: hora,
      };

      // Intentar imprimir en la impresora térmica USB
      try {
        await imprimirEnTérmica(ticketData);
        setSuccessMessage('✅ Impresión enviada a la térmica');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch (error) {
        // Si falla la térmica, usar impresión del navegador
        console.log('Usando impresión del navegador...');
        imprimirViaBrowser(ticketData);
      }
    } catch (error) {
      console.error('Error imprimiendo ticket:', error);
      alert('Error al imprimir ticket');
    }
  };

  const handleModificacion = async (modificacionId: number, aprobado: boolean, usuarioCaja: string) => {
    try {
      const response = await fetch(`${API.MODIFICACIONES}?id=${modificacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: aprobado ? 'aprobado' : 'rechazado',
          autorizado_por: usuarioCaja
        })
      });

      if (response.ok) {
        const mensaje = aprobado 
          ? '✅ Modificación aprobada exitosamente'
          : '❌ Modificación rechazada';

        setSuccessMessage(mensaje);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          fetchData();
        }, 2000);
      }
    } catch (error) {
      console.error('Error procesando modificación:', error);
      alert('Error al procesar la modificación');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full border border-gray-200"
        >
          <div className="text-center mb-8">
            <Image
              src={IMAGES.LOGO}
              alt="Logo"
              width={80}
              height={80}
              className="w-20 h-20 mx-auto mb-4"
              priority
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Caja</h1>
            <p className="text-gray-600">Acceso Seguro</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ingrese PIN de Caja
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePinSubmit();
                }}
                placeholder="••••"
                className="w-full bg-gray-50 text-gray-900 text-center text-3xl tracking-widest px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              {pinError && (
                <p className="text-red-600 text-sm mt-2 text-center font-medium">{pinError}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePinSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all"
            >
              Acceder
            </motion.button>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">Acceso restringido - Solo personal autorizado</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-700">Cargando cuentas...</p>
        </div>
      </div>
    );
  }

  if (!selectedCuenta) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Image
                src={IMAGES.LOGO}
                alt="Logo"
                width={40}
                height={40}
                className="w-10 h-10"
                priority
              />
              <div>
                <h1 className="font-bold text-3xl text-gray-900">Caja</h1>
                <p className="text-sm text-gray-600">
                  {activeTab === 'abiertas' ? 'Cuentas Activas' : 
                   activeTab === 'cerradas' ? 'Cuentas por Cobrar' : 
                   'Modificaciones Pendientes'} 
                  ({activeTab === 'abiertas' ? cuentasAbiertas.length : 
                    activeTab === 'cerradas' ? cuentasPorCobrar.length :
                    modificacionesPendientes.length})
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                router.push(PAGES.ATIENDEMESERO);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors text-sm font-medium"
            >
              ← Salir
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-gray-100 p-2 rounded-xl flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('abiertas')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'abiertas' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <span>📋 Activas</span>
              {cuentasAbiertas.length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {cuentasAbiertas.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('cerradas')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'cerradas' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <span>💰 Por Cobrar</span>
              {cuentasPorCobrar.length > 0 && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {cuentasPorCobrar.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('modificaciones')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'modificaciones' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-700 hover:bg-white'
              }`}
            >
              <span>⚠️ Modificaciones</span>
              {modificacionesPendientes.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {modificacionesPendientes.length}
                </span>
              )}
            </button>
          </div>

          {/* CUENTAS ABIERTAS */}
          {activeTab === 'abiertas' && (
            cuentasAbiertas.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600">No hay cuentas activas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cuentasAbiertas.map((cuenta) => (
                  <motion.button
                    key={cuenta.id}
                    onClick={() => fetchDetalleCuenta(cuenta)}
                    disabled={loadingDetalle}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-5 rounded-xl border-2 bg-blue-50 border-blue-200 hover:border-blue-400 transition-all text-left shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-gray-900">{cuenta.numero_cuenta}</span>
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{cuenta.mesa_numero ? `Mesa ${cuenta.mesa_numero}` : 'Para Llevar'}</p>
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <p className="text-gray-600 text-xs mb-1">💰 Total</p>
                      <p className="text-3xl font-bold text-blue-600">${(cuenta.total || 0).toFixed(2)}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )
          )}

          {/* CUENTAS POR COBRAR */}
          {activeTab === 'cerradas' && (
            cuentasPorCobrar.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-lg text-gray-600">No hay cuentas por cobrar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cuentasPorCobrar.map((cuenta) => (
                  <motion.button
                    key={cuenta.id}
                    onClick={() => fetchDetalleCuenta(cuenta)}
                    disabled={loadingDetalle}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-5 rounded-xl border-2 bg-emerald-50 border-emerald-200 hover:border-emerald-400 transition-all text-left shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-gray-900">{cuenta.numero_cuenta}</span>
                      <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{cuenta.mesa_numero ? `Mesa ${cuenta.mesa_numero}` : 'Para Llevar'}</p>
                    <div className="bg-white rounded-lg p-3 border border-emerald-100">
                      <p className="text-gray-600 text-xs mb-1">💰 A Cobrar</p>
                      <p className="text-3xl font-bold text-emerald-600">${(cuenta.total || 0).toFixed(2)}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )
          )}

          {/* MODIFICACIONES PENDIENTES */}
          {activeTab === 'modificaciones' && (
            modificacionesPendientes.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-lg text-gray-600">No hay modificaciones pendientes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modificacionesPendientes.map((mod) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {mod.tipo === 'edicion' || mod.tipo === 'edicion_completa' ? '✏️ Editar' : '🗑️ Eliminar'}
                      </span>
                      <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                    </div>
                    <p className="text-sm text-gray-700 mb-2">Pedido: {mod.pedido_numero}</p>
                    <p className="text-sm text-gray-700 mb-4">Cuenta: {mod.cuenta_numero}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setModificacionSeleccionada(mod);
                          setShowModificacionModal(true);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-bold transition-colors text-sm"
                      >
                        👁️ Ver Detalles
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Modal de Modificación Detallada */}
        {modificacionSeleccionada && (
          <ModificacionDetalleModal
            show={showModificacionModal}
            onClose={() => {
              setShowModificacionModal(false);
              setModificacionSeleccionada(null);
            }}
            onApprove={handleAprobarModificacion}
            onReject={handleRechazarModificacion}
            modificacion={modificacionSeleccionada}
            loading={procesandoModificacion}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedCuenta(null)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors text-sm font-medium"
        >
          <X className="w-4 h-4" />
          Volver a Lista
        </button>

        <div className="mb-6">
          <h1 className="font-bold text-3xl text-gray-900">{selectedCuenta.numero_cuenta}</h1>
          <p className="text-lg text-gray-700 mt-1">{selectedCuenta.mesa_numero ? `Mesa ${selectedCuenta.mesa_numero}` : 'Para Llevar'}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200 mb-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Detalle de Pedidos</h2>

          {selectedCuenta.pedidos && selectedCuenta.pedidos.length > 0 ? (
            <div className="space-y-4 mb-6">
              {selectedCuenta.pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-3"
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-blue-200">
                    <div>
                      <span className="text-gray-900 font-bold text-lg">{pedido.numero_pedido}</span>
                      <p className="text-blue-700 text-xs">
                        {new Date(pedido.creado_en).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {pedido.total_descuento && pedido.total_descuento > 0 && (
                        <div className="text-red-600 text-sm font-semibold">
                          -${(pedido.total_descuento || 0).toFixed(2)} 🏷️
                        </div>
                      )}
                      <span className="text-emerald-600 font-bold text-lg">${(pedido.total || 0).toFixed(2)}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditarPedido(pedido)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          title="Editar pedido"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminarPedido(pedido)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {pedido.descuentosAplicados && pedido.descuentosAplicados.length > 0 && (
                    <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                      <p className="text-emerald-800 text-xs font-semibold mb-1">🏷️ Promociones Aplicadas:</p>
                      {pedido.descuentosAplicados.map((desc, idx) => (
                        <div key={idx} className="text-emerald-700 text-xs ml-2">
                          • <span className="font-semibold">{desc.promocionNombre}</span>: -${desc.descuentoTotal.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {pedido.items && pedido.items.length > 0 ? (
                    <div className="space-y-2">
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">
                                <span className="text-blue-600 font-bold mr-2">{item.cantidad}x</span>
                                {item.nombre}
                              </p>
                              {(item.notas || item.especificaciones) && (
                                <p className="text-amber-700 text-xs mt-1 italic bg-amber-50 px-2 py-1 rounded">
                                  📝 {item.notas || item.especificaciones}
                                </p>
                              )}
                            </div>
                            <span className="text-emerald-600 font-semibold ml-3">
                              ${(item.cantidad * item.precio_unitario).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Sin detalles de items</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay detalles disponibles</p>
          )}

          <motion.div
            className="bg-emerald-50 rounded-lg p-4 border border-emerald-200"
          >
            <p className="text-gray-700 text-sm mb-1">💰 Total a Cobrar</p>
            <p className="text-5xl font-black text-emerald-600">
              ${(selectedCuenta.total || 0).toFixed(2)}
            </p>
          </motion.div>
        </motion.div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Botón Imprimir Ticket */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleImprimirTicket}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </motion.button>

          {/* Botón Cerrar Cuenta */}
          {selectedCuenta.estado === ESTADOS.CUENTA.ABIERTA && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                if (confirm('¿Cerrar esta cuenta?')) {
                  try {
                    const response = await fetch(API.CUENTA_BY_ID(selectedCuenta.id), {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        estado: ESTADOS.CUENTA.CERRADA
                      })
                    });
                    if (response.ok) {
                      setSuccessMessage('✅ Cuenta cerrada exitosamente');
                      setShowSuccess(true);
                      setTimeout(() => {
                        setShowSuccess(false);
                        setSelectedCuenta(null);
                        fetchData();
                      }, 2000);
                    }
                  } catch (error) {
                    alert('Error al cerrar cuenta');
                  }
                }
              }}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <CheckCircle className="w-5 h-5" />
              Cerrar Cuenta
            </motion.button>
          )}
        </div>

        {selectedCuenta.estado === ESTADOS.CUENTA.CERRADA && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setTotalAmount(selectedCuenta.total || 0);
              setShowPayment(true);
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 rounded-lg font-bold transition-all text-lg flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <CreditCard className="w-6 h-6" />
            Cobrar Ahora
          </motion.button>
        )}
      </div>

      {/* Modal Pago */}
      <AnimatePresence>
        {showPayment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-900 text-xl font-bold">Finalizar Cobro</h3>
                  <button
                    onClick={() => setShowPayment(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3">Monto a Cobrar</label>
                    <div className="bg-gray-50 text-gray-900 text-3xl font-bold px-4 py-3 rounded-lg text-center border-2 border-gray-200">
                      ${totalAmount.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-3">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                          paymentMethod === 'cash'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        Efectivo
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                          paymentMethod === 'card'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        Tarjeta
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCobrarCuenta}
                    disabled={!paymentMethod || totalAmount === 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Confirmar Cobro
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      {/* Modal Editar Pedido - Nuevo Sistema Robusto */}
      {selectedCuenta && pedidoAEditar && (
        <PedidoEditCompleteModal
          show={showEditarModal}
          onClose={() => {
            setShowEditarModal(false);
            setPedidoAEditar(null);
          }}
          onSave={handleGuardarEdicion}
          pedido={pedidoAEditar}
          cuenta={selectedCuenta}
          loading={false}
        />
      )}

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50"
                >
                  <div className="text-5xl">✓</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-gray-900 whitespace-pre-line">
                    {successMessage}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Eliminación de Pedido */}
      {selectedCuenta && pedidoAEliminar && (
        <PedidoDeleteDetailModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setPedidoAEliminar(null);
          }}
          onConfirm={confirmarEliminarPedido}
          pedido={pedidoAEliminar}
          cuenta={selectedCuenta}
          loading={eliminando}
        />
      )}

      {/* Notificaciones */}
      <NotificacionesStack
        notificaciones={notificaciones}
        onDismiss={dismissNotificacion}
      />
    </div>
  );
}
