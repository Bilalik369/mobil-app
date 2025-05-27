import { Text, View , KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useState,  } from "react";
import styles from "../../assets/styles/signup.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stor/authStore";

export default function Signup() {
        const [username , setUsername] = useState('');
        const [email , setEmail] = useState('');
        const [password , setPassword] = useState('');
        const [showPassword , setShowPassword] = useState(false);

        const {user , isLoading , register} = useAuthStore();

        const router = useRouter()

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

        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <Ionicons
              name="person-outline"
              size={20}
              color={COLORS.primary}
              style={styles.inputIcon}/>
              
              <TextInput
              style={styles.input}
              placeholder="iken bilal"
              placeholderTextColor={COLORS.placeholderText}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"/>

            </View>

          </View>


          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}> 
            <Ionicons
            name="mail-outline" 
            size={20}
            color={COLORS.primary}
            style ={styles.inputIcon}/>
            <TextInput
            style={styles.input}
            placeholder="exempl@gmail.com"
            placeholderTextColor={COLORS.placeholderText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"/>

          </View>


          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
              name="lock-closed-outline"
              size={20}
              style={styles.inputIcon}
              color={COLORS.primary}/>

              <TextInput
              style={styles.input}
              placeholder="******"
              placeholderTextColor={COLORS.placeholderText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}/>
              <TouchableOpacity 
              onPress={()=> setShowPassword(!showPassword)}
              style ={styles.eyeIcon}>
              <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={COLORS.primary}/>
                
              </TouchableOpacity>
              

            </View>

          </View>
         
          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff"/>

            ) : (
              <Text style={styles.buttonText}>Sign up</Text>
            )}

          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already an account</Text>
            <TouchableOpacity onPress={()=> router.back()}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
