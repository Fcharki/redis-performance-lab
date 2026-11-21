import axios from "axios";
import type { ProductsResponse } from "../types";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000
});

export async function fetchSQLite() {
  return api.get<ProductsResponse>("/products");
}

export async function fetchRedis() {
  return api.get<ProductsResponse>("/products/cached");
}

export async function testRateLimit() {
  return api.get("/limited");
}

export default api;
