import { Link } from "expo-router";
import { Text, View, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { useAuthStore,  } from "../stor/authStore";
import { useEffect } from "react";
export default function Index() {
  const {user , token , checkAuth , logout} = useAuthStore()


  useEffect(()=>{
    checkAuth()
  } , [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello {user?.username}</Text>
      <Text style={styles.title}>token : {token} </Text>

    <TouchableOpacity onPress={logout}>
      <Text>Logout</Text>

    </TouchableOpacity>


      <Link href="/(auth)/signup" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Signup</Text>
        </Pressable>
      </Link>

      <Link href="/(auth)" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
