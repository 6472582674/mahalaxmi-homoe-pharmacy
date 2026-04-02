import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, LogIn, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product as BackendProduct } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { INITIAL_PRODUCTS, type Product } from "../data/products";
import { useActor } from "../hooks/useActor";
import { getOrCreateStorageClient } from "../hooks/useStorageClient";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const CATEGORIES = ["Remedies", "Tonics", "Oils", "Skincare"];
const EMOJIS = [
  "🌼",
  "🍒",
  "🫚",
  "🌿",
  "🦴",
  "💪",
  "🌻",
  "🌾",
  "💜",
  "🧴",
  "🌹",
  "🍃",
];

interface BackendOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  total: bigint;
  upiTxnRef: string;
  createdAt: bigint;
  items: Array<{
    productId: string;
    productName: string;
    price: bigint;
    qty: bigint;
  }>;
}

function backendProductToFrontend(bp: BackendProduct): Product {
  return {
    id: bp.id,
    name: bp.name,
    description: bp.description,
    price: Number(bp.price),
    category: bp.category as Product["category"],
    imageEmoji: bp.imageEmoji,
    imageHash: bp.imageHash,
    stock: Number(bp.stock),
    active: bp.active,
  };
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e"];

function ProductDialog({
  open,
  onClose,
  product,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  product: Partial<Product>;
  onSave: (p: Omit<Product, "id">, imageFile: File | null) => Promise<void>;
}) {
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: product.name || "",
    description: product.description || "",
    price: product.price || 0,
    category: (product.category as Product["category"]) || "Remedies",
    imageEmoji: product.imageEmoji || "🌼",
    imageHash: product.imageHash || "",
    stock: product.stock || 10,
    active: product.active ?? true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      category: (product.category as Product["category"]) || "Remedies",
      imageEmoji: product.imageEmoji || "🌼",
      imageHash: product.imageHash || "",
      stock: product.stock || 10,
      active: product.active ?? true,
    });
    setImageFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setIsUploading(false);
  }, [product]);

  // Revoke object URL on cleanup
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    // If we have a file to upload, show progress
    if (imageFile) setIsUploading(true);
    try {
      // Wrap onSave but capture upload progress
      await onSave(form, imageFile);
    } finally {
      setSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product.id ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {/* Image Upload */}
          <div>
            <Label>Product Image</Label>
            <div className="mt-1 space-y-2">
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: file input trigger */}
              <div
                className="border-2 border-dashed border-border rounded-lg h-36 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden bg-muted/30"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="admin.product.dropzone"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : form.imageHash ? (
                  <div className="text-center text-muted-foreground text-sm">
                    <ImagePlus className="h-8 w-8 mx-auto mb-1 opacity-50" />
                    <span>Image saved. Click to replace.</span>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImagePlus className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Click to upload image</p>
                    <p className="text-xs opacity-60 mt-1">PNG, JPG, WEBP</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                data-ocid="admin.product.upload_button"
              />
              {imageFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {imageFile.name} (
                  {(imageFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
              {isUploading && (
                <div
                  className="space-y-1"
                  data-ocid="admin.upload.loading_state"
                >
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading image...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1"
              data-ocid="admin.product.name.input"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="mt-1"
              data-ocid="admin.product.description.textarea"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price (₹)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
                className="mt-1"
                data-ocid="admin.product.price.input"
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
                className="mt-1"
                data-ocid="admin.product.stock.input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({ ...form, category: v as Product["category"] })
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="admin.product.category.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Emoji (fallback)</Label>
              <Select
                value={form.imageEmoji}
                onValueChange={(v) => setForm({ ...form, imageEmoji: v })}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="admin.product.emoji.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMOJIS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active-toggle"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded"
              data-ocid="admin.product.active.checkbox"
            />
            <Label htmlFor="active-toggle">Active (visible on store)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="admin.product.dialog.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || isUploading}
            data-ocid="admin.product.dialog.save_button"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPage() {
  const { t } = useLanguage();
  const { isAdmin, adminLogin } = useAuth();
  const { actor, isFetching } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});

  const loadProducts = useCallback(async () => {
    if (!actor) return;
    setLoadingProducts(true);
    try {
      const bp = await actor.getProducts();
      setProducts(bp.map(backendProductToFrontend));
    } catch (_err) {
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  }, [actor]);

  const loadOrders = useCallback(async () => {
    if (!actor) return;
    setLoadingOrders(true);
    try {
      const bo = await actor.getOrders();
      setOrders(bo as BackendOrder[]);
    } catch (_err) {
      toast.error("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }, [actor]);

  useEffect(() => {
    if (isAdmin && actor && !isFetching) {
      loadProducts();
      loadOrders();
    }
  }, [isAdmin, actor, isFetching, loadProducts, loadOrders]);

  const handleLogin = () => {
    const ok = adminLogin(username, password);
    if (!ok) setLoginError("Invalid credentials. Try admin / admin123");
  };

  const handleSaveProduct = async (
    form: Omit<Product, "id">,
    imageFile: File | null,
  ) => {
    if (!actor) {
      toast.error("Backend not connected");
      return;
    }

    let imageHash = form.imageHash;

    // Upload image if a new file was selected
    if (imageFile) {
      try {
        const storageClient = await getOrCreateStorageClient();
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        const { hash } = await storageClient.putFile(bytes, (_pct) => {});
        imageHash = hash;
      } catch (_err) {
        toast.error("Image upload failed. Please try again.");
        return;
      }
    }

    const backendProduct: BackendProduct = {
      id: editingProduct.id || `p${Date.now()}`,
      name: form.name,
      description: form.description,
      price: BigInt(Math.round(form.price)),
      category: form.category,
      imageEmoji: form.imageEmoji,
      imageHash,
      stock: BigInt(Math.round(form.stock)),
      active: form.active,
    };

    try {
      if (editingProduct.id) {
        await actor.updateProduct(editingProduct.id, backendProduct);
      } else {
        await actor.addProduct(backendProduct);
      }
      toast.success("Product saved!");
      setDialogOpen(false);
      await loadProducts();
    } catch (_err) {
      toast.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!actor) return;
    try {
      await actor.deleteProduct(id);
      toast.success("Product removed");
      await loadProducts();
    } catch (_err) {
      toast.error("Failed to delete product");
    }
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    if (!actor) return;
    try {
      await actor.updateOrderStatus(orderId, status);
      await loadOrders();
      toast.success("Order status updated");
    } catch (_err) {
      toast.error("Failed to update order status");
    }
  };

  const handleSeedProducts = async () => {
    if (!actor) return;
    setSeeding(true);
    try {
      await Promise.all(
        INITIAL_PRODUCTS.map((p) =>
          actor.addProduct({
            id: p.id,
            name: p.name,
            description: p.description,
            price: BigInt(Math.round(p.price)),
            category: p.category,
            imageEmoji: p.imageEmoji,
            imageHash: "",
            stock: BigInt(Math.round(p.stock)),
            active: p.active,
          }),
        ),
      );
      toast.success("Sample products added successfully!");
      await loadProducts();
    } catch (_err) {
      toast.error("Failed to seed products");
    } finally {
      setSeeding(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {t("admin_login")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">admin / admin123</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div>
            <Label>{t("username")}</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="mt-1"
              data-ocid="admin.username.input"
            />
          </div>
          <div>
            <Label>{t("password")}</Label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              type="password"
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              data-ocid="admin.password.input"
            />
          </div>
          {loginError && (
            <p
              className="text-destructive text-sm"
              data-ocid="admin.login.error_state"
            >
              {loginError}
            </p>
          )}
          <Button
            className="w-full gap-2"
            onClick={handleLogin}
            data-ocid="admin.login.submit_button"
          >
            <LogIn className="h-4 w-4" /> {t("login")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-6">
        Admin Panel
      </h1>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" data-ocid="admin.products.tab">
            {t("manage_products")}
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="admin.orders.tab">
            {t("manage_orders")}
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-foreground">
                {loadingProducts ? "Loading..." : `${products.length} products`}
              </h2>
              {products.length === 0 && !loadingProducts && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  onClick={handleSeedProducts}
                  disabled={seeding}
                  data-ocid="admin.seed_products.button"
                >
                  {seeding ? "Seeding..." : "Add Sample Products"}
                </Button>
              )}
            </div>
            <Button
              size="sm"
              className="gap-1"
              onClick={() => {
                setEditingProduct({});
                setDialogOpen(true);
              }}
              data-ocid="admin.add_product.button"
            >
              <Plus className="h-4 w-4" /> {t("add_product")}
            </Button>
          </div>

          {loadingProducts ? (
            <div className="space-y-2" data-ocid="admin.products.loading_state">
              {SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="admin.products.empty_state"
                      >
                        No products yet. Click "Add Sample Products" to get
                        started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p, idx) => (
                      <TableRow
                        key={p.id}
                        data-ocid={`admin.products.item.${idx + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{p.imageEmoji}</span>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {p.name}
                              </span>
                              {p.imageHash && (
                                <span className="text-xs text-secondary">
                                  ✓ Image uploaded
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{p.category}</Badge>
                        </TableCell>
                        <TableCell>₹{p.price}</TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              p.active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditingProduct(p);
                                setDialogOpen(true);
                              }}
                              data-ocid={`admin.products.edit_button.${idx + 1}`}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-7 w-7"
                              onClick={() => handleDeleteProduct(p.id)}
                              data-ocid={`admin.products.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <h2 className="font-semibold text-foreground mb-4">
            {loadingOrders ? "Loading..." : `${orders.length} orders`}
          </h2>
          {loadingOrders ? (
            <div className="space-y-2" data-ocid="admin.orders.loading_state">
              {["o1", "o2", "o3"].map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="admin.orders.empty_state"
            >
              No orders yet.
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>UPI Ref</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => (
                    <TableRow
                      key={order.id}
                      data-ocid={`admin.orders.item.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {order.id}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-muted-foreground text-xs">
                            {order.customerPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(
                          Number(order.createdAt) / 1_000_000,
                        ).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        ₹{Number(order.total)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {order.upiTxnRef}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => handleOrderStatus(order.id, v)}
                        >
                          <SelectTrigger
                            className={`h-7 text-xs w-32 ${
                              STATUS_COLORS[order.status] || ""
                            }`}
                            data-ocid={`admin.orders.status.select.${idx + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "pending",
                              "confirmed",
                              "shipped",
                              "delivered",
                              "cancelled",
                            ].map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
