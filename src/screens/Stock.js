import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigation } from "@react-navigation/native";
import { collection, deleteDoc, doc, getDocs, setDoc, getDoc } from "firebase/firestore";
import { IconButton, Modal, Portal, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, db } from "../firebase";
//import Swal from "sweetalert2";

const Stocks = () => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    pname: "",
    categories: "",
    estock: "",
    cstock: "",
    price: "",
  });
  const [newStock, setNewStock] = useState({
    no: "",
    pname: "",
    categories: "",
    estock: "",
    cstock: "",
    price: "",
  });

  const [user, loading] = useAuthState(auth);
  const navigation = useNavigation();

  useEffect(() => {
    if (loading) return;
    if (!user) navigation.navigate("Login");
  }, [user, loading, navigation]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "admins", "saitraders@gmail.com");
        const productsRef = collection(userDocRef, "Purchase");
        const productSnapshot = await getDocs(productsRef);

        const productList = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [user]);

  const getNextProductNo = () => {
    if (products.length === 0) return 101;
    const maxNo = Math.max(...products.map((prod) => parseInt(prod.no, 10)));
    return maxNo + 1;
  };

  const handleInputChange = (name, value) => {
    setNewStock((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    if (!user) return;

    try {
        const userDocRef = doc(db, "admins", "saitraders@gmail.com");
        const productsRef = collection(userDocRef, "Purchase");

        let existingProduct = null;
        if (newStock.no) {
            const productDocRef = doc(productsRef, newStock.no);
            const productSnap = await getDoc(productDocRef);
            if (productSnap.exists()) {
                existingProduct = productSnap.data();
            }
        }

        if (existingProduct) {
            newStock.estock = existingProduct.estock - newStock.cstock;
        } else {
            if (!newStock.estock) {
                newStock.estock = 0;
            }
            newStock.estock -= newStock.cstock;
        }

        if (!newStock.no) {
            newStock.no = Date.now().toString();
        }

        const productDocRef = doc(productsRef, newStock.no);
        await setDoc(productDocRef, newStock, { merge: true });

        setProducts((prev) => {
            const updatedProducts = prev.filter((prod) => prod.no !== newStock.no);
            return [...updatedProducts, newStock];
        });

        console.log(newStock.no ? "Product updated successfully!" : "Product added successfully!");

        setShowModal(false);
        setNewStock({
            no: "",
            pname: "",
            categories: "",
            estock: "",
            cstock: "",
            price: "",
        });

    } catch (error) {
        console.error("Error adding/updating product:", error);
    }
};

const handleRemoveProduct = async (no) => {
    if (!user) {
        console.log("Not Logged In. Please log in to delete a product.");
        return;
    }

    try {
        const userDocRef = doc(db, "admins", "saitraders@gmail.com");
        const productRef = doc(userDocRef, "Stocks", no);

        const confirmDelete = window.confirm("Are you sure you want to delete this product?");
        if (confirmDelete) {
            await deleteDoc(productRef);
            setProducts((prev) => prev.filter((product) => product.no !== no));
            console.log("Product deleted successfully.");
        }

    } catch (error) {
        console.error("Error deleting product:", error);
    }
};


  const filteredProducts = products.filter((product) => {
    const { pname, categories, estock, cstock, price } = product;
    const query = searchQuery.toLowerCase();

    return (
      (pname && pname.toLowerCase().includes(query)) ||
      (categories && categories.toLowerCase().includes(query)) ||
      (estock && estock.toString().toLowerCase().includes(query)) ||
      (cstock && cstock.toString().toLowerCase().includes(query)) ||
      (price && price.toString().toLowerCase().includes(query))
    );
  });

  const totalProducts = filteredProducts.length;
  const totalStock = filteredProducts.reduce(
    (acc, product) => acc + parseInt(product.estock),
    0
  );
  const totalPrice = filteredProducts
    .reduce(
      (acc, product) =>
        acc + parseFloat(product.price) * parseInt(product.estock),
      0
    )
    .toFixed(2);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Stock Management</Text>

      {/* Info Boxes */}
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Total Products</Text>
          <Text style={styles.infoValue}>{totalProducts}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Total Stock</Text>
          <Text style={styles.infoValue}>{totalStock}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Total Price</Text>
          <Text style={styles.infoValue}>₹{totalPrice}</Text>
        </View>
      </View>

      {/* Filter Panel */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterHeader}>Filters</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by Product Name"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by Product Name"
          value={filters.pname}
          onChangeText={(text) => handleFilterChange("pname", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by Categories"
          value={filters.categories}
          onChangeText={(text) => handleFilterChange("categories", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by Estock"
          value={filters.estock}
          onChangeText={(text) => handleFilterChange("estock", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by Cstock"
          value={filters.cstock}
          onChangeText={(text) => handleFilterChange("cstock", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Filter by Price"
          value={filters.price}
          onChangeText={(text) => handleFilterChange("price", text)}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.no}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text style={styles.productText}>P.No: {item.no}</Text>
            <Text style={styles.productText}>Product Name: {item.pname}</Text>
            <Text style={styles.productText}>Existing Stock: {item.estock}</Text>
            <Text style={styles.productText}>Current Stock: {item.cstock}</Text>
            <Text style={styles.productText}>Price: ₹{item.price}</Text>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                onPress={() => {
                  setShowModal(true);
                  setNewStock(item);
                }}
              />
              <IconButton
                icon="delete"
                 onPress={() => handleRemoveProduct(item.no)}
              />
            </View>
          </View>
        )}
      />

      {/* Add Product Modal */}
      <Portal>
        <Modal visible={showModal} onDismiss={() => setShowModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add/Update Product</Text>
            <TextInput
              style={styles.input}
              placeholder="Product No"
              value={newStock.no}
              editable={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={newStock.pname}
              onChangeText={(text) => handleInputChange("pname", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Categories"
              value={newStock.categories}
              onChangeText={(text) => handleInputChange("categories", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Estock"
              value={newStock.estock}
              onChangeText={(text) => handleInputChange("estock", text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Cstock"
              value={newStock.cstock}
              onChangeText={(text) => handleInputChange("cstock", text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={newStock.price}
              onChangeText={(text) => handleInputChange("price", text)}
              keyboardType="numeric"
            />
            <Button mode="contained" onPress={handleFormSubmit}>
              {newStock.no ? "Update Product" : "Add Product"}
            </Button>
            <Button onPress={() => setShowModal(false)}>Cancel</Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f4f8",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  infoValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  productItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  productText: {
    fontSize: 16,
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
});

export default Stocks;