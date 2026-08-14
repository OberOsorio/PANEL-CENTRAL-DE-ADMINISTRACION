import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Receipt, DollarSign, CheckCircle2, AlertTriangle, Clock, Search, FileText, Download, X, ShieldCheck, Printer } from 'lucide-react';
import { Invoice } from '../../types';

export const BillingView: React.FC = () => {
  const { invoices, markInvoiceAsPaid } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [selectedCertificateInvoice, setSelectedCertificateInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter((i) => {
    if (!i) return false;
    const clientName = i.clientName || '';
    const id = i.id || '';
    const description = i.description || '';

    const matchesSearch =
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'TODOS' || i.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const totalCollected = invoices
    .filter((i) => i.status === 'Pagada')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalPending = invoices
    .filter((i) => i.status === 'Pendiente' || i.status === 'Vencida')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div />

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Total Recaudado (Pagadas)
            </span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            ${totalCollected.toLocaleString()} USD
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Cartera Pendiente / Vencida
            </span>
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            ${totalPending.toLocaleString()} USD
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID factura, cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['TODOS', 'Pagada', 'Pendiente', 'Vencida'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Factura / Cliente</th>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Monto Total</th>
                <th className="py-3 px-4">Emisión</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones / Certificados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{inv.clientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.id}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {inv.description}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    ${inv.totalAmount.toLocaleString()} USD
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{inv.issueDate}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{inv.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        inv.status === 'Pagada'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : inv.status === 'Vencida'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {inv.status !== 'Pagada' ? (
                      <button
                        onClick={() => markInvoiceAsPaid(inv.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500 shadow transition-all"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Registrar Pago
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedCertificateInvoice(inv)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-sm"
                        title="Generar Certificado Oficial de Paz y Salvo"
                      >
                        <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Generar Paz y Salvo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paz y Salvo Official Certificate Modal */}
      {selectedCertificateInvoice && (
        <div
          onClick={() => setSelectedCertificateInvoice(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                    Certificado Oficial de Paz y Salvo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Acreditación financiera de suscripción al día
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCertificateInvoice(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 print:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Official Document Sheet */}
            <div className="rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 space-y-6 text-slate-800 dark:text-slate-200 text-xs">
              <div className="text-center space-y-1 pb-4 border-b border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] font-mono font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                  CAMPAÑA GANADORA AI CENTRAL
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  CERTIFICADO DE PAZ Y SALVO N° PYS-2026-{selectedCertificateInvoice.id.split('-')[2] || '101'}
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  Fecha de expedición: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="space-y-3 leading-relaxed">
                <p>
                  Por medio del presente documento, la plataforma <strong>CAMPAÑA GANADORA AI CENTRAL</strong> hace constar de manera oficial que la organización y cliente corporativo:
                </p>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Organización / Cliente:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedCertificateInvoice.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Factura Conciliada:</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{selectedCertificateInvoice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Concepto Abonado:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{selectedCertificateInvoice.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Monto Pagado:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${selectedCertificateInvoice.totalAmount.toLocaleString()} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Estado Financiero:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> AL DÍA - PAZ Y SALVO
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Se certifica que la entidad se encuentra libre de mora o cartera pendiente para el periodo de suscripción contratado, manteniendo activa su licencia de uso de Software Electoral multi-tenant.
                </p>
              </div>

              {/* Digital Signature */}
              <div className="pt-4 border-t border-emerald-100 dark:border-emerald-900/40 flex justify-between items-end text-[10px]">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Gerencia Financiera</p>
                  <p className="text-slate-400 font-mono">Firma Digital Verificada ID: {selectedCertificateInvoice.id}-SIG</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-md bg-emerald-600 text-white font-mono font-bold">
                    VERIFICADO ONLINE
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
              <button
                onClick={() => setSelectedCertificateInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 print:hidden"
              >
                Cerrar
              </button>
              <button
                onClick={handlePrintCertificate}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all print:hidden"
              >
                <Printer className="h-4 w-4" />
                Imprimir / Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

