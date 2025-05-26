<<<<<<< HEAD
import { Text, View , KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useState,  } from "react";
import styles from "../../assets/styles/signup.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function Signup() {
        const [username , setUsername] = useState('');
        const [email , setEmail] = useState('');
        const [password , setPassword] = useState('');
        const [showPassword , setShowPassword] = useState(false);

        const {user , isLoading , register} = useAuthStore();
=======
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from "react-native";
import styles from "../../assets/styles/login.styles";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Link } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> 386b2fe70d58879c7ad9bf96229cf0318bccd1e9

  const handlelogin = () => {
    
  };

<<<<<<< HEAD
        const handleSignup= async()=>{
          const result = await register(username , email , password) 
          if(!result.success) Alert.alert("error" , result.error);
        }
  return (
    <KeyboardAvoidingView style={{flex :1}}
    behavior={Platform.OS === "ios" ? "padding" : "height" }
    > 
      <ScrollView contentContainerStyle={{flexGrow:1}}>
    <View style={styles.container}>
      <View style={styles.card}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.title}>BookIⴽen</Text>
          <Text style={styles.subtitle}>Share your favorite reads</Text>
=======
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.topIllustration}>
            <Image
              source={require("../../assets/images/i.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
>>>>>>> 386b2fe70d58879c7ad9bf96229cf0318bccd1e9

          <View style={styles.card}>
            <View style={styles.formContainer}>
            
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.placeholderText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.placeholderText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showpassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showpassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showpassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handlelogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

             
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don’t have an account?</Text>
                <Link href="/signup" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>Sign up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
<<<<<<< HEAD
      </View>
    </View>
    </ScrollView>
=======
      </ScrollView>
>>>>>>> 386b2fe70d58879c7ad9bf96229cf0318bccd1e9
    </KeyboardAvoidingView>
  );
}
