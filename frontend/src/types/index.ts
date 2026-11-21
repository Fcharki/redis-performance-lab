export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface ProductsResponse {
  source: "sqlite" | "redis";
  cache?: "HIT" | "MISS";
  duration: number;
  data: Product[];
}

export interface RequestMetric {
  id: number;
  label: string;
  duration: number;
  source: string;
  timestamp: string;
}

export interface ChartPoint {
  request: number;
  SQLite: number | null;
  Redis: number | null;
}
