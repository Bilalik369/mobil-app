    import { Text, TextInput, View, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform , ScrollView, Alert    } from "react-native";
    import styles from "../../assets/styles/login.styles";
    import { useState } from "react";
    import { Image } from "react-native";
    import {Ionicons}  from "@expo/vector-icons"
  import COLORS from "../../constants/colors";
  import { Link } from "expo-router";
  import { useAuthStore } from "../../stor/authStore";




    export default function Login() {
      const [email , setEmail] = useState('');
      const [password , setPassword] = useState('');
      const [showpassword , setShowPassword] = useState(false);
      const { user, isLoading, login } = useAuthStore();



    



      const handlelogin = async() =>{
        const result = await login(email , password);
        if(!result.success) Alert.alert("Error" , result.error);


      }
      return (

        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
          <ScrollView contentContainerStyle={{flexGrow:1}}>
        <View style={styles.container}>
          <View style= {styles.topIllustration}>
            <Image
            source={require("../../assets/images/i.png")}
            style = {styles.illustrationImage}
            resizeMode="contain"/>

          </View>
          <View style={styles.card}>
          <View style={styles.formContainer}>
            {/* emal */}
            <View style={styles.inputGroup}>
                
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                name="mail-outline"
                size={20}
                color={COLORS.primary}
                style ={styles.inputIcon}/>

                <TextInput
                style ={styles.input}
                placeholder="Entre your email"
                placeholderTextColor={COLORS.placeholderText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"

                autoCapitalize="none"

                />
                  
                

              </View>
              
            </View>

            
              {/* psrd */}
              <View style={styles.inputGroup}
              >
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
                  placeholder="Entre your password"
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showpassword}
                  />
                  <TouchableOpacity
                  onPress={() => setShowPassword(!showpassword)}
                  style={styles.eyeIcon}>
                    <Ionicons
                    name={showpassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.button} onPress={handlelogin}
              disabled ={isLoading}>
                {
                  isLoading ? (
                    <ActivityIndicator color="#fff"/>
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )
                }

              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don t have an account</Text>
                <Link href= "/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign up</Text>
                </TouchableOpacity>
                </Link>

              </View>
  
            


          

          </View>
          </View>
          
          
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
      );
    }
