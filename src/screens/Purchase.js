
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons"; // For edit/delete icons
import {  db } from '../firebase';
import {  doc, collection, addDoc, setDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

const Purchase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
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
  const price = filteredProducts
  .reduce(
    (acc, product) =>
      acc + parseFloat(product.price) * parseInt(product.estock),
    0
  )
  .toFixed(2);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
   const [filters, setFilters] = useState({
      pname: "",
      categories: "",
      estock: "",
      cstock: "",
      price: "",
    });
  const [newProduct, setNewProduct] = useState({
    no: "",
    sname: "",
    phone: "",
    add: "",
    pname: "",
    estock: "",
    price: "",
  });

  const handleInputChange = (name, value) => {
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleAddProduct = async () => {
    try {
      const userEmail = "nithya@gmail.com"; // Replace with dynamic user email if needed
      const productId = newProduct.no; // Assuming "no" is your product ID (e.g., "1001")
      
      if (!productId) {
        console.error("Error: Product ID is missing!");
        return;
      }
  
      // Reference to the specific document with a custom ID
      const productDocRef = doc(db, "users", userEmail, "Purchase", productId);
  
      // Set document with the provided ID
      await setDoc(productDocRef, newProduct);
  
      // Fetch the updated list from Firestore after adding
      fetchProducts(); 
  
      // Reset modal and form
      setModalVisible(false);
      setNewProduct({ no: "", sname: "", phone: "", add: "", pname: "", estock: "", price: "" });
  
      console.log(`Product added successfully with ID: ${productId}`);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEditProduct = async () => {
    try {
      const userEmail = "nithya@gmail.com";
      const userDocRef = doc(db, "users", userEmail);
      const productsRef = collection(userDocRef, "Purchase");
  
      // Find the product reference by `no`
      const productDocRef = doc(productsRef, newProduct.no);
  
      // Update product in Firestore
      await setDoc(productDocRef, newProduct);
  
      // Update state
      setProducts(
        products.map((product) =>
          product.no === newProduct.no ? newProduct : product
        )
      );
  
      setModalVisible(false);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };


  const handleRemoveProduct = async (productId) => {
    try {
      const userEmail = "nithya@gmail.com";
      const productDocRef = doc(db, "users", userEmail, "Purchase", productId);
      
      await deleteDoc(productDocRef);
      
      fetchProducts(); // Refresh product list after deletion
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };


  const openEditModal = (product) => {
    setNewProduct(product);
    setEditMode(true);
    setModalVisible(true);
  };

  const fetchProducts = async () => {
    try {
      const userEmail = "nithya@gmail.com"; // Replace with dynamic user email if needed
      const userDocRef = doc(db, "users", userEmail);
      const productsRef = collection(userDocRef, "Purchase");
  
      const querySnapshot = await getDocs(productsRef);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Firestore document ID
        ...doc.data(),
      }));
  
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Purchase Page</Text>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
 {/* Info Boxes */}
 <View style={styles.container}>
 <View style={styles.rowContainer}>
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
        <Text style={styles.infoValue}>₹{price}</Text>
      </View>
    </View>

    </View>
 {/* Filter Panel */}
 <View style={styles.filterContainer}>
  <Text style={styles.filterHeader}>Filters</Text>
  <View style={styles.filtersGrid}>
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
</View>

      {/* Scrollable Table */}
      <ScrollView horizontal={true} style={styles.scrollContainer}>
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>P. No</Text>
          <Text style={styles.headerCell}>Supplier</Text>
          <Text style={styles.headerCell}>Phone</Text>
          <Text style={styles.headerCell}>Address</Text>
          <Text style={styles.headerCell}>Product Name</Text>
          <Text style={styles.headerCell}>Stock</Text>
          <Text style={styles.headerCell}>Price</Text>
          <Text style={styles.headerCell}>Actions</Text>
        </View>

        {/* Product List */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id} // Using Firestore doc ID as key
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.cell}>{item.no}</Text>
              <Text style={styles.cell}>{item.sname}</Text>
              <Text style={styles.cell}>{item.phone}</Text>
              <Text style={styles.cell}>{item.add}</Text>
              <Text style={styles.cell}>{item.pname}</Text>
              <Text style={styles.cell}>{item.estock}</Text>
              <Text style={styles.cell}>₹{item.price}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <AntDesign name="edit" size={20} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveProduct(item.id)}>
                  <AntDesign name="delete" size={20} color="red" style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </ScrollView>

      {/* Add Product Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditMode(false);
          setModalVisible(true);
          setNewProduct({ no: "", sname: "", phone: "", add: "", pname: "", estock: "", price: "" });
        }}
      >
        <Text style={styles.addButtonText}>+ Add Product</Text>
      </TouchableOpacity>

      {/* Modal for Add/Edit Product */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editMode ? "Edit Product" : "Add Product"}</Text>
            <TextInput placeholder="Product No." value={newProduct.no} onChangeText={(text) => handleInputChange("no", text)} style={styles.input} />
            <TextInput placeholder="Supplier Name" value={newProduct.sname} onChangeText={(text) => handleInputChange("sname", text)} style={styles.input} />
            <TextInput placeholder="Phone" value={newProduct.phone} onChangeText={(text) => handleInputChange("phone", text)} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Address" value={newProduct.add} onChangeText={(text) => handleInputChange("add", text)} style={styles.input} />
            <TextInput placeholder="Product Name" value={newProduct.pname} onChangeText={(text) => handleInputChange("pname", text)} style={styles.input} />
            <TextInput placeholder="Existing Stock" value={newProduct.estock} onChangeText={(text) => handleInputChange("estock", text)} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Price" value={newProduct.price} onChangeText={(text) => handleInputChange("price", text)} style={styles.input} keyboardType="numeric" />

            <TouchableOpacity style={styles.submitButton} onPress={editMode ? handleEditProduct : handleAddProduct}>
              <Text style={styles.submitButtonText}>{editMode ? "Update Product" : "Add Product"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  tableContainer: {
    marginTop:2,
    minWidth: 1400,
    marginLeft:20,
  },
  tableHeader: {
    marginTop:2,
    flexDirection: "row",
    backgroundColor: "#ddd",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#bbb",
  },
  headerCell: {
    flex: 1,
    minWidth: 100, // Ensures all columns have a consistent width
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    flex: 1,
    minWidth: 100, // Ensures text doesn't get squished
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    minWidth: 120, // Ensures space for buttons
  },
  addButton: { backgroundColor: "blue", padding: 10, borderRadius: 5, alignSelf: "center", marginTop: 10 },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "bold",  alignItems: "left" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: 300, padding: 20, backgroundColor: "white", borderRadius: 10, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  scrollContainer: {
    flexGrow: 1,
  },
  rowContainer: {
    flexDirection: "row", // Aligns all boxes in one line
   
    alignItems: "center", // Aligns items vertically
    padding: 0,
  },
  infoBox: {
    backgroundColor: "#fff", // White background for each box
    padding: 10,
    borderRadius: 8, // Rounded corners
    marginHorizontal: 5, // Adds spacing between boxes
    alignItems: "center",
    shadowColor: "#000", // Optional shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow effect for Android
  },
  infoText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop:20,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  filtersGrid: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows wrapping to the next row
    justifyContent: "space-between",
  },
  input: {
    width: "32%", // Adjust for 3 columns
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default Purchase;
