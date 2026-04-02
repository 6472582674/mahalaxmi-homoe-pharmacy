import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderItem {
    qty: bigint;
    productId: string;
    productName: string;
    price: bigint;
}
export interface OrderInput {
    customerName: string;
    total: bigint;
    customerPhone: string;
    upiTxnRef: string;
    customerAddress: string;
    items: Array<OrderItem>;
}
export interface Order {
    id: string;
    customerName: string;
    status: string;
    total: bigint;
    customerPhone: string;
    createdAt: bigint;
    upiTxnRef: string;
    customerAddress: string;
    items: Array<OrderItem>;
}
export interface UserProfile {
    name: string;
    phone: string;
}
export interface Product {
    id: string;
    active: boolean;
    imageHash: string;
    name: string;
    description: string;
    imageEmoji: string;
    stock: bigint;
    category: string;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(input: OrderInput): Promise<string>;
    deleteProduct(id: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(phone: string): Promise<Array<Order>>;
    getOrder(id: string): Promise<Order | null>;
    getOrders(): Promise<Array<Order>>;
    getProduct(id: string): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(productName: string): Promise<Array<Product>>;
    updateOrderStatus(orderId: string, newStatus: string): Promise<void>;
    updateProduct(id: string, product: Product): Promise<void>;
}
