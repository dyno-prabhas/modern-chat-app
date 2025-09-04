import * as React from "react";
import { Image, SafeAreaView, View } from "react-native";

import {
  isClerkAPIResponseError,
  useSignIn,
  useSSO,
  useUser,
} from "@clerk/clerk-expo";
import { ClerkAPIError } from "@clerk/types";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { appwriteConfig, tablesDB } from "@/utils/appwrite";
import { ID, Query } from "react-native-appwrite";


// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const { startSSOFlow } = useSSO();
  const { user, isSignedIn } = useUser();
  const { signIn, setActive } = useSignIn();
  const [errors, setErrors] = React.useState<ClerkAPIError[]>([]);


  const upsertUserRow = async (user: any) => {
  try {
    const authId = user.id;
    const email = user.primaryEmailAddress?.emailAddress || "";
    const name =
      user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const photo = user.imageUrl || null;

    // Check if user already exists in Appwrite
    const existing = await tablesDB.getRow(
      appwriteConfig.db,
      appwriteConfig.col.users,
      Query.equal("authId", authId)
    );

    console.log('existing',existing);
    

    if (existing.total > 0) {
      // ✅ Update existing user
      console.log("✅ Updated user:", existing);
      return existing;
    } else {
      // ✅ Create new user
      const newUser = await tablesDB.createRow(
        appwriteConfig.db,
        appwriteConfig.col.users,
        ID.unique(),
        { authId, email, name, photo }
      );
      console.log("✅ Created user:");
      return
    }
  } catch (err) {
    console.error("❌ Error in upsertUserRow:", err);
    throw err;
  }
};



  const handleSignInWithGoogle = React.useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_google",
          // Defaults to current path
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        
        if (user) {
        await upsertUserRow(user);
      }
        
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      if (isClerkAPIResponseError(err)) setErrors(err.errors);
      console.error(JSON.stringify(err, null, 2));
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* spacer */}
      <View style={{ flex: 0.1 }} />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View style={{ gap: 20, alignItems: "center" }}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 100, height: 100 }}
          />
          <Text style={{ fontSize: 32, fontWeight: "bold" }}>
            Modern Chat App
          </Text>
          <Text>Sign in to continue</Text>
          {errors.map((error) => (
            <Text key={error.code}>{error.code}</Text>
          ))}
        </View>

        {/* spacer */}
        <View style={{ flex: 1 }} />

        <Button
          onPress={handleSignInWithGoogle}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 30,
          }}
        >
          <Image
            source={require("@/assets/images/google-icon.png")}
            style={{ width: 20, height: 20 }}
          />
          <Text style={{ color: "black", fontWeight: "500" }}>
            Sign in with Google
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}