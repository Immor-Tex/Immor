                                            import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { CashFlow } from '../../types/cashflow';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';

function getMonthString(date: Date) {
  return date.toISOString().slice(0, 7); // yyyy-mm
}

// Helper to sort flows by created_at descending
function sortByCreatedAtDesc(a: CashFlow, b: CashFlow) {
  return b.created_at.localeCompare(a.created_at);
}

// Helper to sort flows by created_at ascending
function sortByCreatedAtAsc(a: CashFlow, b: CashFlow) {
  return a.created_at.localeCompare(b.created_at);
}

const CashFlowPage = () => {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productCost, setProductCost] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [marketingCost, setMarketingCost] = useState('');
  const [sales, setSales] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getMonthString(new Date()));
  const [expandedDays, setExpandedDays] = useState<{ [day: string]: boolean }>({});

  useEffect(() => {
    fetchCashFlows();
  }, []);

  const fetchCashFlows = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('cash_flows')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError('Failed to load cash flows');
    else setCashFlows(data as CashFlow[]);
    setIsLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const pc = productCost === '' ? 0 : Number(productCost);
    const sc = shippingCost === '' ? 0 : Number(shippingCost);
    const oc = otherCost === '' ? 0 : Number(otherCost);
    const mc = marketingCost === '' ? 0 : Number(marketingCost);
    const s = sales === '' ? 0 : Number(sales);
    if (pc < 0 || sc < 0 || oc < 0 || mc < 0 || s < 0) {
      setError('All amounts must be non-negative');
      return;
    }
    const { error } = await supabase.from('cash_flows').insert([
      {
        product_cost: pc,
        shipping_cost: sc,
        other_cost: oc,
        marketing_cost: mc,
        sales: s,
      },
    ]);
    if (error) setError('Failed to add transaction');
    else {
      setProductCost('');
      setShippingCost('');
      setOtherCost('');
      setMarketingCost('');
      setSales('');
      fetchCashFlows();
    }
  };

  // Filter by selected month
  const filtered = cashFlows.filter(c => c.created_at.slice(0, 7) === selectedMonth);

  // Group by day
  const dailyMap = new Map<string, CashFlow[]>();
  filtered.forEach(c => {
    const day = c.created_at.slice(0, 10); // yyyy-mm-dd
    if (!dailyMap.has(day)) dailyMap.set(day, []);
    dailyMap.get(day)!.push(c);
  });
  const dailyRows = Array.from(dailyMap.entries()).map(([day, flows]) => {
    const product = flows.reduce((sum, c) => sum + c.product_cost, 0);
    const shipping = flows.reduce((sum, c) => sum + c.shipping_cost, 0);
    const other = flows.reduce((sum, c) => sum + c.other_cost, 0);
    const marketing = flows.reduce((sum, c) => sum + c.marketing_cost, 0);
    const sales = flows.reduce((sum, c) => sum + c.sales, 0);
    const profit = sales - (product + shipping + other + marketing);
    return { day, product, shipping, other, marketing, sales, profit, flows };
  });

  // Monthly summary
  const totalProduct = dailyRows.reduce((sum, r) => sum + r.product, 0);
  const totalShipping = dailyRows.reduce((sum, r) => sum + r.shipping, 0);
  const totalOther = dailyRows.reduce((sum, r) => sum + r.other, 0);
  const totalMarketing = dailyRows.reduce((sum, r) => sum + r.marketing, 0);
  const totalSales = dailyRows.reduce((sum, r) => sum + r.sales, 0);
  const totalProfit = dailyRows.reduce((sum, r) => sum + r.profit, 0);

  // Month options for selector
  const allMonths = Array.from(new Set(cashFlows.map(c => c.created_at.slice(0, 7)))).sort().reverse();

  return (
    <AdminLayout title="Cash Flow Management">
      <div className="max-w-5xl mx-auto py-8">
        {/* Month Selector and Summary */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-accent-800">Month:</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm focus:ring-accent-500 focus:border-accent-500"
            >
              {allMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center gap-4 border border-accent-100">
            <div className="flex flex-col items-center">
              <span className="text-lg text-gray-500">Total Sales</span>
              <span className="text-xl font-bold text-green-700">{totalSales.toFixed(2)} MAD</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg text-gray-500">Total Expenses</span>
              <span className="text-xl font-bold text-red-700">{(totalProduct + totalShipping + totalOther + totalMarketing).toFixed(2)} MAD</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg text-gray-500">Total Profit</span>
              <span className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{totalProfit.toFixed(2)} MAD</span>
            </div>
          </div>
        </div>
        {/* Add Transaction Form */}
        <form
          onSubmit={handleAdd}
          className="w-full max-w-4xl flex flex-col md:flex-row gap-2 items-center bg-accent-50 rounded-xl p-4 border border-accent-100 shadow mb-8"
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={productCost}
            onChange={e => setProductCost(e.target.value)}
            placeholder="Product Cost"
            className="w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-accent-500 focus:border-accent-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={shippingCost}
            onChange={e => setShippingCost(e.target.value)}
            placeholder="Shipping Cost"
            className="w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-accent-500 focus:border-accent-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={otherCost}
            onChange={e => setOtherCost(e.target.value)}
            placeholder="Other Cost"
            className="w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-accent-500 focus:border-accent-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={marketingCost}
            onChange={e => setMarketingCost(e.target.value)}
            placeholder="Marketing Cost (ADS)"
            className="w-36 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-accent-500 focus:border-accent-500"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={sales}
            onChange={e => setSales(e.target.value)}
            placeholder="Sales"
            className="w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-accent-500 focus:border-accent-500"
          />
          <button
            type="submit"
            className="inline-flex items-center px-3 py-1 bg-accent-600 text-white rounded font-semibold hover:bg-accent-700 text-sm transition"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </button>
        </form>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        {/* Daily Table with Expandable Rows */}
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-accent-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marketing</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : dailyRows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No transactions found</td></tr>
              ) : (
                dailyRows.map(row => (
                  <React.Fragment key={row.day}>
                    <tr key={row.day} className="bg-accent-50">
                      <td className="px-4 py-2 text-sm font-semibold text-accent-800">
                        <span className="cursor-pointer inline-flex items-center" onClick={() => setExpandedDays(ed => ({ ...ed, [row.day]: !ed[row.day] }))}>
                          {expandedDays[row.day] ? <ChevronDown className="w-5 h-5 mr-1" /> : <ChevronRight className="w-5 h-5 mr-1" />}
                          {row.day}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">{row.product.toFixed(2)} MAD</td>
                      <td className="px-4 py-2 text-sm">{row.shipping.toFixed(2)} MAD</td>
                      <td className="px-4 py-2 text-sm">{row.other.toFixed(2)} MAD</td>
                      <td className="px-4 py-2 text-sm">{row.marketing.toFixed(2)} MAD</td>
                      <td className="px-4 py-2 text-sm text-green-700 font-bold">{row.sales.toFixed(2)} MAD</td>
                      <td className={`px-4 py-2 text-sm font-bold ${row.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{row.profit.toFixed(2)} MAD</td>
                    </tr>
                    {expandedDays[row.day] && (
                      <tr>
                        <td colSpan={7} className="bg-white px-8 pb-4">
                          <table className="min-w-full">
                            <thead>
                              <tr>
                                <th className="px-2 py-1 text-xs text-gray-500 text-center">Time</th>
                                <th className="px-2 py-1 text-xs text-gray-500 text-center">Product</th>
                                <th className="px-2 py-1 text-xs text-gray-500 text-center">Shipping</th>
                                <th className="px-2 py-1 text-xs text-gray-500 text-center">Other</th>
                                <th className="px-2 py-1 text-xs text-gray-500 text-center">Marketing</th>
                                <th className="px-2 py-1 text-xs text-gray-500 text-center">Sales</th>
                                <th className="px-2 py-1 text-xs text-gray-500 text-center">Profit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.flows.slice().sort(sortByCreatedAtAsc).map(f => (
                                <tr key={f.id}>
                                  <td className="px-2 py-1 text-xs text-gray-700 text-center">{f.created_at.slice(11, 16)}</td>
                                  <td className="px-2 py-1 text-xs text-center">{f.product_cost.toFixed(2)} MAD</td>
                                  <td className="px-2 py-1 text-xs text-center">{f.shipping_cost.toFixed(2)} MAD</td>
                                  <td className="px-2 py-1 text-xs text-center">{f.other_cost.toFixed(2)} MAD</td>
                                  <td className="px-2 py-1 text-xs text-center">{f.marketing_cost.toFixed(2)} MAD</td>
                                  <td className="px-2 py-1 text-xs text-green-700 font-bold text-center">{f.sales.toFixed(2)} MAD</td>
                                  <td className={`px-2 py-1 text-xs font-bold text-center ${f.sales - (f.product_cost + f.shipping_cost + f.other_cost + f.marketing_cost) >= 0 ? 'text-green-700' : 'text-red-700'}`}>{(f.sales - (f.product_cost + f.shipping_cost + f.other_cost + f.marketing_cost)).toFixed(2)} MAD</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CashFlowPage; 