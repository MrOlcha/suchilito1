'use client';

import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Notification, useNotification } from './notification';
import { ConfirmModal } from './confirm-modal';

interface DetallePedido {
  id: number;
  producto_nombre: string;
  cantidad: number;
  especificaciones: string;
  notas: string;
  precio_unitario: number;
  subtotal: number;
}

export function PedidoItemsClient({
  pedidoId,
  detalles,
  onItemsChange,
}: {
  pedidoId: number;
  detalles: DetallePedido[];
  onItemsChange?: () => void;
}) {
  const [items, setItems] = useState(detalles);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<DetallePedido | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; itemId: number | null; itemName: string }>({
    isOpen: false,
    itemId: null,
    itemName: '',
  });
  const { notification, showSuccess, showError } = useNotification();

  const handleEditClick = (item: DetallePedido) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleEditSave = async () => {
    if (!editForm) return;

    try {
      const response = await fetch(`/pos/api/detalle-pedidos/${editForm.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cantidad: editForm.cantidad,
          precio_unitario: editForm.precio_unitario,
          especificaciones: editForm.especificaciones,
          notas: editForm.notas,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el item');
      }

      // Calcular el nuevo subtotal
      const nuevoSubtotal = editForm.cantidad * editForm.precio_unitario;

      // Actualizar el item en la lista con el nuevo subtotal
      const itemActualizado = {
        ...editForm,
        subtotal: nuevoSubtotal,
      };

      setItems(items.map((item) => (item.id === editForm.id ? itemActualizado : item)));
      setEditingId(null);
      setEditForm(null);
      showSuccess('Item editado con éxito');
      
      // Notificar al padre que hubo cambios
      if (onItemsChange) {
        onItemsChange();
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al actualizar item');
    }
  };

  const handleDeleteClick = (item: DetallePedido) => {
    setConfirmModal({
      isOpen: true,
      itemId: item.id,
      itemName: item.producto_nombre,
    });
  };

  const handleConfirmDelete = async () => {
    const itemId = confirmModal.itemId;
    if (!itemId) return;

    setConfirmModal({ isOpen: false, itemId: null, itemName: '' });
    setDeletingId(itemId);

    try {
      const response = await fetch(`/pos/api/detalle-pedidos/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el item');
      }

      // Actualizar la lista de items inmediatamente
      setItems(items.filter((item) => item.id !== itemId));
      showSuccess('Item eliminado con éxito');

      // Notificar al padre que hubo cambios
      if (onItemsChange) {
        onItemsChange();
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Error al eliminar item');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, itemId: null, itemName: '' });
  };

  return (
    <>
      {notification && <Notification {...notification} />}
      <div className="divide-y divide-gray-200">
        {items.length === 0 ? (
          <div className="px-6 py-2 text-gray-600 text-xs">Sin items</div>
        ) : (
          items.map((item, idx) => (
          editingId === item.id && editForm ? (
            // Modo edición
            <div key={item.id} className={`p-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'} border border-blue-300 bg-blue-50`}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Producto</label>
                  <input
                    type="text"
                    value={editForm.producto_nombre}
                    onChange={(e) => setEditForm({ ...editForm, producto_nombre: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Cantidad</label>
                    <input
                      type="number"
                      value={editForm.cantidad}
                      onChange={(e) => setEditForm({ ...editForm, cantidad: parseInt(e.target.value) || 1 })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Precio c/u</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.precio_unitario}
                      onChange={(e) => setEditForm({ ...editForm, precio_unitario: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Especificaciones</label>
                  <input
                    type="text"
                    value={editForm.especificaciones || ''}
                    onChange={(e) => setEditForm({ ...editForm, especificaciones: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Notas</label>
                  <input
                    type="text"
                    value={editForm.notas || ''}
                    onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleEditSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditForm(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Modo vista
            <div key={item.id} className={`p-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'} hover:bg-gray-50 transition-colors group`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex-shrink-0">
                      {item.cantidad}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.producto_nombre}
                    </h4>
                  </div>

                  {item.especificaciones && (
                    <p className="text-xs text-blue-600 mb-0.5 italic ml-8">
                      • {item.especificaciones}
                    </p>
                  )}

                  {item.notas && (
                    <p className="text-xs text-amber-600 ml-8">
                      📝 {item.notas}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 items-start flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-gray-600 mb-0.5">
                      ${item.precio_unitario.toFixed(2)}
                    </div>
                    <div className="text-sm font-bold text-gray-900 bg-green-50 px-2 py-0.5 rounded inline-block">
                      ${item.subtotal.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                      title="Editar item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      disabled={deletingId === item.id}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Eliminar item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        ))
      )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Eliminar Item"
        message={`¿Estás seguro de que quieres eliminar "${confirmModal.itemName}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
