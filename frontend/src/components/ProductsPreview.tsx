import { Database } from "lucide-react";
import type { Product } from "../types";

interface ProductsPreviewProps {
  products: Product[];
}

export default function ProductsPreview({
  products
}: ProductsPreviewProps) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-[#111927] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Products preview</h3>
          <p className="mt-1 text-xs text-slate-400">
            {products.length} products returned
          </p>
        </div>
        <Database className="text-emerald-400" size={20} />
      </div>

      {products.length ? (
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-xs">
            <thead className="text-slate-400">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 8).map(product => (
                <tr
                  key={product.id}
                  className="border-t border-slate-800"
                >
                  <td className="p-3 text-slate-400">
                    {product.id}
                  </td>
                  <td className="p-3 font-medium">
                    {product.name}
                  </td>
                  <td className="p-3 text-slate-400">
                    {product.category}
                  </td>
                  <td className="p-3">
                    ${product.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center text-xs text-slate-500">
          Fetch products to display them here.
        </div>
      )}
    </div>
  );
}
