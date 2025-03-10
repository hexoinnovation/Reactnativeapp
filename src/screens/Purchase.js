
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
  const [products, setProducts] = useState([
    { no: "8108000", sname: "Surendar", phone: "8800997777", add: "Bangalore", pname: "Titanium metal scrap", estock: "150", price: "360" },
    { no: "OEx005", sname: "Sattur", phone: "989898989", add: "Sattur", pname: "Tape", estock: "18", price: "100" },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
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
      const userDocRef = doc(db, "users", userEmail);
      const productsRef = collection(userDocRef, "Purchase");
  
      await addDoc(productsRef, newProduct);
  
      // Fetch the updated list from Firestore after adding
      fetchProducts(); 
  
      // Reset modal and form
      setModalVisible(false);
      setNewProduct({ no: "", sname: "", phone: "", add: "", pname: "", estock: "", price: "" });
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

      {/* Scrollable Table */}
      <ScrollView horizontal>
        <View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  tableHeader: { flexDirection: "row", backgroundColor: "#ddd", padding: 10, borderRadius: 5, width: 900 },
  headerCell: { width: 110, fontWeight: "bold", textAlign: "center" },
  row: { flexDirection: "row", padding: 10, backgroundColor: "white", marginBottom: 5, borderRadius: 5, width: 900 },
  cell: { width: 110, textAlign: "center" },
  actions: { width: 110, flexDirection: "row", justifyContent: "center" },
  addButton: { backgroundColor: "blue", padding: 10, borderRadius: 5, alignSelf: "center", marginTop: 10 },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: 300, padding: 20, backgroundColor: "white", borderRadius: 10, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default Purchase;
