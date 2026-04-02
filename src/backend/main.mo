import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";
import Migration "migration";
import Int "mo:core/Int";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

(with migration = Migration.run)
actor {
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    imageEmoji : Text;
    imageHash : Text;
    stock : Nat;
    active : Bool;
  };

  public type Order = {
    id : Text;
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    items : [OrderItem];
    total : Nat;
    upiTxnRef : Text;
    status : Text;
    createdAt : Int;
  };

  type OrderItem = {
    productId : Text;
    productName : Text;
    qty : Nat;
    price : Nat;
  };

  type OrderInput = {
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    items : [OrderItem];
    total : Nat;
    upiTxnRef : Text;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
  };

  // Product controller
  let products = Map.empty<Text, Product>();
  // Order controller
  let orders = Map.empty<Text, Order>();
  // UserProfile controller
  let userProfiles = Map.empty<Principal, UserProfile>();
  // AccessControl controller wrapped in MixinAuthorization for role-based authentication
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  // Storage controller
  include MixinStorage();

  // Queries
  public query ({ caller }) func getMyOrders(phone : Text) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    // Verify the caller owns this phone number via their profile
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: User profile not found. Please save your profile first.");
      };
      case (?profile) {
        if (profile.phone != phone and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
      };
    };

    orders.values().filter(func(order) { order.customerPhone == phone }).toArray();
  };

  public query ({ caller }) func getProduct(id : Text) : async ?Product {
    products.get(id);
  };

  func compareProductsByName(a : Product, b : Product) : Order.Order {
    Text.compare(a.name, b.name);
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray().sort(
      compareProductsByName
    );
  };

  func compareOrders(a : Order, b : Order) : Order.Order {
    Int.compare(b.createdAt, a.createdAt);
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray().sort(
      compareOrders
    );
  };

  public query ({ caller }) func getOrder(id : Text) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view order details");
    };
    orders.get(id);
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().filter(
      func(p) {
        p.category == category and p.active;
      }
    ).toArray();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func searchProducts(productName : Text) : async [Product] {
    let results = List.empty<Product>();
    for (p in products.values()) {
      if (p.name.contains(#text productName)) {
        results.add(p);
      };
    };
    results.toArray();
  };

  // Admin Mutator service
  public shared ({ caller }) func updateProduct(id : Text, product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        let updatedProduct = {
          product with
          imageHash = product.imageHash;
          active = existingProduct.active;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, newStatus : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    let order = switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) { order };
    };
    let updatedOrder = {
      order with
      status = newStatus;
    };
    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        let updatedProduct = {
          existingProduct with
          active = false;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let existingProduct = {
      product with
      imageHash = product.imageHash;
      active = true;
    };
    products.add(product.id, existingProduct);
  };

  // Order API - No auth
  public shared ({ caller }) func createOrder(input : OrderInput) : async Text {
    let orderId = input.customerPhone # input.upiTxnRef # Time.now().toText();
    let order = {
      input with
      id = orderId;
      status = "pending";
      createdAt = Time.now();
    };
    orders.add(orderId, order);
    orderId;
  };

};
