import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, db } from "../firebase";

const BusinessDetails = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    businessName: "",
    registrationNumber: "",
    contactNumber: "",
    city: "",
    state: "",
    gstNumber: "",
  });
  const [filters, setFilters] = useState({
    businessName: "",
    registrationNumber: "",
    contactNumber: "",
    city: "",
    state: "",
    gstNumber: "",
  });
  const [businesses, setBusinesses] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!user) return;

      try {
        // Updated path: /users/nithya@gmail.com/Businesses
        const userDocRef = doc(db, "users", "nithya@gmail.com");
        const businessesRef = collection(userDocRef, "Businesses");
        const businessSnapshot = await getDocs(businessesRef);
        const businessList = businessSnapshot.docs.map((doc) => doc.data());
        setBusinesses(businessList);
      } catch (error) {
        console.error("Error fetching businesses: ", error);
      }
    };

    fetchBusinesses();
  }, [user]);

  const handleInputChange = (name, value) => {
    setNewBusiness((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBusiness = async () => {
    if (Object.values(newBusiness).some((field) => !field)) {
      return Alert.alert("Error", "Please fill all fields.");
    }

    try {
      // Updated path: /users/nithya@gmail.com/Businesses
      const userDocRef = doc(db, "users", "nithya@gmail.com");
      const businessRef = collection(userDocRef, "Businesses");
      await setDoc(doc(businessRef, newBusiness.registrationNumber), newBusiness);

      setBusinesses((prev) => [...prev, newBusiness]);
      Alert.alert("Success", "Business added successfully!");
      closeModal();
    } catch (error) {
      console.error("Error adding business: ", error);
      Alert.alert("Error", "Failed to add business.");
    }
  };

  const handleRemoveBusiness = async (registrationNumber) => {
    Alert.alert(
      "Are you sure?",
      "You won’t be able to undo this action!",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
          try {
            // Updated path: /users/nithya@gmail.com/Businesses/{registrationNumber}
            const businessDoc = doc(db, "users", "nithya@gmail.com", "Businesses", registrationNumber);
            await deleteDoc(businessDoc);

            setBusinesses((prev) =>
              prev.filter((business) => business.registrationNumber !== registrationNumber)
            );

            Alert.alert("Deleted!", "Business has been deleted.");
          } catch (error) {
            console.error("Error deleting business: ", error);
            Alert.alert("Error", "Failed to delete business.");
          }
        }},
      ]
    );
  };

  const handleEditBusiness = (business) => {
    setIsEditMode(true);
    setNewBusiness(business);
    setShowModal(true);
  };

  const handleUpdateBusiness = async () => {
    if (Object.values(newBusiness).some((field) => !field)) {
      return Alert.alert("Error", "Please fill all fields.");
    }

    try {
      // Updated path: /users/nithya@gmail.com/Businesses/{registrationNumber}
      const userDocRef = doc(db, "users", "nithya@gmail.com");
      const businessRef = collection(userDocRef, "Businesses");
      const businessDocRef = doc(businessRef, newBusiness.registrationNumber);

      await updateDoc(businessDocRef, newBusiness);

      setBusinesses((prev) =>
        prev.map((business) =>
          business.registrationNumber === newBusiness.registrationNumber ? newBusiness : business
        )
      );

      Alert.alert("Success", "Business updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error updating business: ", error);
      Alert.alert("Error", "Failed to update business.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setNewBusiness({
      businessName: "",
      registrationNumber: "",
      contactNumber: "",
      city: "",
      state: "",
      gstNumber: "",
    });
  };

  const filteredBusinesses = businesses.filter((business) =>
    Object.keys(filters).every((key) =>
      business[key]?.toLowerCase().includes(filters[key]?.toLowerCase() || "")
    )
  );

  const placeholderNames = {
    businessName: "Business Name",
    registrationNumber: "Registration Number",
    contactNumber: "Contact Number",
    city: "City",
    state: "State",
    gstNumber: "GST Number",
  };

  const totalBusinesses = businesses.length;
  const totalGSTNumbers = businesses.filter((b) => b.gstNumber).length;
  const totalStates = new Set(businesses.map((b) => b.state)).size;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Business Details</Text>

      {/* Info Boxes */}
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Total Businesses</Text>
          <Text style={styles.infoNumber}>{totalBusinesses}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Total GST Numbers</Text>
          <Text style={styles.infoNumber}>{totalGSTNumbers}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Active States</Text>
          <Text style={styles.infoNumber}>{totalStates}</Text>
        </View>
      </View>

      {/* Add Business Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addButtonText}>Add Business</Text>
      </TouchableOpacity>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter Businesses</Text>
        <View style={styles.filterInputs}>
          {Object.keys(placeholderNames).map((key) => (
            <View key={key} style={styles.filterInput}>
              <Text style={styles.filterLabel}>{placeholderNames[key]}</Text>
              <TextInput
                style={styles.input}
                value={filters[key]}
                onChangeText={(value) => handleFilterChange(key, value)}
                placeholder={`Search by ${placeholderNames[key]}`}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Business Table */}
      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.registrationNumber}
        renderItem={({ item }) => (
          <View style={styles.businessItem}>
            <Text style={styles.businessText}>{item.businessName}</Text>
            <Text style={styles.businessText}>{item.registrationNumber}</Text>
            <Text style={styles.businessText}>{item.contactNumber}</Text>
            <Text style={styles.businessText}>{item.city}</Text>
            <Text style={styles.businessText}>{item.state}</Text>
            <Text style={styles.businessText}>{item.gstNumber}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEditBusiness(item)}>
                <Icon name="edit" size={20} color="#FFA500" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveBusiness(item.registrationNumber)}>
                <Icon name="delete" size={20} color="#FF0000" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditMode ? "Edit Business" : "Add Business"}</Text>
            <ScrollView>
              {Object.keys(placeholderNames).map((key) => (
                <View key={key} style={styles.modalInput}>
                  <Text style={styles.modalLabel}>{placeholderNames[key]}</Text>
                  <TextInput
                    style={styles.input}
                    value={newBusiness[key]}
                    onChangeText={(value) => handleInputChange(key, value)}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={isEditMode ? styles.updateButton : styles.addButton}
                onPress={isEditMode ? handleUpdateBusiness : handleAddBusiness}
              >
                <Text style={styles.buttonText}>
                  {isEditMode ? "Update Business" : "Add Business"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F0F4F8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#1E3A8A",
    marginHorizontal: 8,
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  infoNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  addButton: {
    backgroundColor: "#1E3A8A",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  filterContainer: {
    backgroundColor: "#1E3A8A",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  filterInputs: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterInput: {
    width: "48%",
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 8,
  },
  businessItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 8,
  },
  businessText: {
    fontSize: 14,
    color: "#1E3A8A",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    color: "#1E3A8A",
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    backgroundColor: "#6B7280",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BusinessDetails;