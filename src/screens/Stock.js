import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigation } from "@react-navigation/native";
import { collection, deleteDoc, doc, getDocs, setDoc, getDoc } from "firebase/firestore";
import { IconButton, Modal, Portal, Button ,DataTable , Card,useTheme} from "react-native-paper";
import { auth, db } from "../firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

//import Swal from "sweetalert2";

const Stocks = () => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { colors } = useTheme(); 
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
        const userDocRef = doc(db, "users", "nithya@gmail.com");
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
        const userDocRef = doc(db, "users", "nithya@gmail.com");
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
        const userDocRef = doc(db, "users", "nithya@gmail.com");
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
      <Card style={styles.card}>
      <Card.Content>
        {/* Filter Header */}
        <Text style={styles.filterHeader}>Filters</Text>

        {/* Search Input (Full Width) */}
        <TextInput
          mode="outlined"
          placeholder="Search by Product Name"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          left={<TextInput.Icon name="magnify" size={24} />} // Increased icon size
          style={styles.fullWidthInput}
        />

        {/* Filter Inputs (3 Rows & 2 Columns) */}
        <View style={styles.row}>
          <TextInput
            mode="outlined"
            placeholder=" Filter by Product Name"
            value={filters.pname}
            onChangeText={(text) => handleFilterChange("pname", text)}
            left={<TextInput.Icon name="tag" size={24} />} // Increased icon size
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            placeholder=" Filter by Categories"
            value={filters.categories}
            onChangeText={(text) => handleFilterChange("categories", text)}
            left={<TextInput.Icon name="shape" size={24} />}
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            mode="outlined"
            placeholder="Filter by Estock"
            value={filters.estock}
            onChangeText={(text) => handleFilterChange("estock", text)}
            left={<TextInput.Icon name="warehouse" size={24} />}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            mode="outlined"
            placeholder="Cstock"
            value={filters.cstock}
            onChangeText={(text) => handleFilterChange("cstock", text)}
            left={<TextInput.Icon name="package-variant" size={24} />}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <TextInput
            mode="outlined"
            placeholder=" Filter by Price"
            value={filters.price}
            onChangeText={(text) => handleFilterChange("price", text)}
            left={<TextInput.Icon name="currency-inr" size={24} />}
            style={styles.input}
            keyboardType="numeric"
          />
          {/* Empty Input for Alignment */}
          <View style={[styles.input, { borderWidth: 0 }]} />
        </View>
      </Card.Content>
    </Card>
      <DataTable style={styles.table}>
      {/* Table Header */}
      <DataTable.Header style={styles.tableHeader}>
        <DataTable.Title textStyle={styles.headerText}>P.No</DataTable.Title>
        <DataTable.Title textStyle={styles.headerText}>Product Name</DataTable.Title>
        <DataTable.Title numeric textStyle={styles.headerText}>Existing Stock</DataTable.Title>
        <DataTable.Title numeric textStyle={styles.headerText}>Current Stock</DataTable.Title>
        <DataTable.Title numeric textStyle={styles.headerText}>Price</DataTable.Title>
        <DataTable.Title textStyle={styles.headerText}>Actions</DataTable.Title>
      </DataTable.Header>

      {/* Table Rows */}
      {filteredProducts.map((item) => (
        <DataTable.Row key={item.no} style={styles.tableRow}>
          <DataTable.Cell>{item.no}</DataTable.Cell>
          <DataTable.Cell>{item.pname}</DataTable.Cell>
          <DataTable.Cell numeric>{item.estock}</DataTable.Cell>
          <DataTable.Cell numeric>{item.cstock}</DataTable.Cell>
          <DataTable.Cell numeric>₹{item.price}</DataTable.Cell>
          <DataTable.Cell>
            <View style={styles.actions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => {
                  setShowModal(true);
                  setNewStock(item);
                }}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleRemoveProduct(item.no)}
              />
            </View>
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  
    <Portal>
      <Modal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Card.Content>
              {/* Modal Header */}
              <Text style={styles.modalHeader}>Add/Update Product</Text>

              {/* Product No */}
              <TextInput
                mode="outlined"
                placeholder="Product No"
                value={newStock.no}
                editable={false}
                style={styles.input}
              />

              {/* Product Name */}
              <TextInput
                mode="outlined"
                placeholder="Product Name"
                value={newStock.pname}
                onChangeText={(text) => handleInputChange("pname", text)}
                style={styles.input}
              />

              {/* Categories */}
              <TextInput
                mode="outlined"
                placeholder="Categories"
                value={newStock.categories}
                onChangeText={(text) => handleInputChange("categories", text)}
                style={styles.input}
              />

              {/* Estock */}
              <TextInput
                mode="outlined"
                placeholder="Estock"
                value={newStock.estock}
                onChangeText={(text) => handleInputChange("estock", text)}
                keyboardType="numeric"
                style={styles.input}
              />

              {/* Cstock */}
              <TextInput
                mode="outlined"
                placeholder="Cstock"
                value={newStock.cstock}
                onChangeText={(text) => handleInputChange("cstock", text)}
                keyboardType="numeric"
                style={styles.input}
              />

              {/* Price */}
              <TextInput
                mode="outlined"
                placeholder="Price"
                value={newStock.price}
                onChangeText={(text) => handleInputChange("price", text)}
                keyboardType="numeric"
                style={styles.input}
              />

              {/* Buttons */}
              <Button
                mode="contained"
                onPress={handleFormSubmit}
                style={styles.submitButton}
              >
                {newStock.no ? "Update Product" : "Add Product"}
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </Card.Content>
          </ScrollView>
        </Card>
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
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%", // Width of the modal
    maxHeight: "100%", // Increased height
    borderRadius: 16, // Curved edges
    elevation: 4, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scrollContent: {
    padding: 16, // Padding inside the modal
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#143f7d", // Dark blue color
    textAlign: "center",
  },
  input: {
    marginBottom: 12, // Spacing between inputs
    backgroundColor: "#fff", // White background for inputs
    height:50,
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: "#143f7d", // Dark blue color
  },
  cancelButton: {
    marginTop: 8,
    borderColor: "#143f7d", // Dark blue border
  },
    table: {
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 4, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tableHeader: {
    backgroundColor: "#143f7d", // Dark blue header
  },
  headerText: {
    color: "#fff", 
    fontWeight: "bold", 
    fontSize:18,
  },
  tableRow: {
    backgroundColor: "#fff", // White rows
  },
  tableRow: {
    backgroundColor: "#fff", // White rows
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  card: {
    margin: 16,
    
    width:"100%",
    borderRadius: 16, // Curved edges for the card
    elevation: 6, // More shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    backgroundColor: "#fff", // White background
    padding: 16, // Padding inside the card
  },
  filterHeader: {
    fontSize: 20, // Slightly bigger text
    fontWeight: "bold",
    marginBottom: 16,
    color: "#143f7d", // Dark blue color
    textAlign: "center", // Centered header
  },
  fullWidthInput: {
    marginBottom: 12,
    borderRadius: 8, // Rounded edges
    height: 50, // Slightly taller input
    width:"100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  input: {
    flex: 1, // Equal width for both inputs
    marginHorizontal: 6, // Spacing between inputs
    borderRadius: 10, // More rounded edges
    height: 50, // Increased height
    borderColor:"#143f7d",
    borderWidth:2,
   
  },
});

export default Stocks;