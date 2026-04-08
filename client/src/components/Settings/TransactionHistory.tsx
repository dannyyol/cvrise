import { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { planService } from '../../services/planService';
import type { TokenTransaction } from '../../services/planService';

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    planService.getTransactions(page)
      .then((response) => {
        setTransactions(response.items);
        setTotalPages(response.pages);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) {
      setIsLoading(true);
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setIsLoading(true);
      setPage(page + 1);
    }
  };

  if (isLoading && transactions.length === 0) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded-lg"></div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <History className="w-4 h-4" />
          Transaction History
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Page {page} of {totalPages}</span>
          </div>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
            transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                    <p className="font-medium text-gray-900">{tx.description || 'Transaction'}</p>
                    <p className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString()}
                    </p>
                </div>
                </div>
                <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} Tokens
                </div>
            </div>
            ))
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all text-gray-600"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="p-1.5 rounded hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all text-gray-600"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
