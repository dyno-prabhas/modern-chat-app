import Input from "@/components/Input";
import { appwriteConfig, tablesDB } from "@/utils/appwrite";
import { useUser } from "@clerk/clerk-expo";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ID, Query } from "react-native-appwrite";

// Main App component
export default function App() {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (user) {
      fetchUsers(user.id); // pass Clerk user.id
    }

  }, [user]);

  // const filteredUsers = users.filter(user =>
  //   (user.name?.toLowerCase() || user.email?.toLowerCase()).includes(
  //     searchQuery.toLowerCase()
  //   )
  // );

  const fetchUsers = async (authId: string) => {
    try {
      const { rows } = await tablesDB.listRows(
        appwriteConfig.db,
        appwriteConfig.col.users,
        [Query.notEqual("authId", authId)]
      );
      // console.log(rows);

      setUsers(rows);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  async function createRoom() {
    try {
      setIsLoading(true);



      let participants: string[] = [];

      if (selectedUser && user) {
        participants = [user.id, selectedUser]; // use authId, not $id
      }

      await tablesDB.createRow(
        appwriteConfig.db,
        appwriteConfig.col.chatRooms,
        ID.unique(),
        {
          title: roomName,
          description: roomDescription,
          isPrivate: true,
          participants: participants,
        }
      );
    } catch (error) {
      console.error("in create room", error);
    } finally {
      setIsLoading(false);
      router.back();
    }
  }


  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              title={isLoading ? "Creating..." : "Create"}
              onPress={() => {
                if (isPrivate && !selectedUser) {
                  setModalVisible(true);
                } else {
                  createRoom();
                }
              }}
              disabled={roomName.length === 0 || isLoading}
            />
          ),
        }}
      />
      <View style={{ padding: 16, gap: 16 }}>
        <Input
          placeholder="Room Name"
          value={roomName}
          onChangeText={setRoomName}
        />
        <Input
          placeholder="Room Description"
          value={roomDescription}
          onChangeText={setRoomDescription}
          multiline
          numberOfLines={4}
          maxLength={100}
          style={{ height: 100 }}
        />

        {/* Private Toggle */}
        <Button title={"Private Room"} onPress={toggleModal} />
      </View>

      {/* User selection modal */}
      <Modal
        animationType="slide"
        transparent={true}
        backdropColor=""
        visible={modalVisible}
        onRequestClose={toggleModal} // This handles the Android back button behavior
      >
        <View style={{ flex: 1, paddingTop: 300,  }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "white" }}>
            Select a User
          </Text>
          <FlatList
            data={users}
            keyExtractor={(item) => item.authId} // ✅ use authId instead of $id
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#ddd",
                  backgroundColor:
                    selectedUser === item.authId ? "#e0e0e0" : "#fff",
                }}
                onPress={() => {
                  setSelectedUser(item.authId); // ✅ store authId

                  // setModalVisible(false);
                }}
              >
                <Text>{item.name || item.email}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
        
      </Modal>
    </>
  );
}

// Stylesheet for the components
const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "#f5f5f5",
  // },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalSubText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },

  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f7',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  selectedUserText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },

  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  list: {
    flex: 1,
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  selectedUserItem: {
    backgroundColor: '#e3f2fd',
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    paddingVertical: 20,
  },
  cancelButton: {
    marginTop: 15,
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

