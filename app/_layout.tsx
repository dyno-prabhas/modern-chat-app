import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "react-native";

import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
    >
    <ClerkLoaded>
        <ThemeProvider value={DarkTheme}>
          <Slot />
          <StatusBar barStyle="light-content" backgroundColor={"black"} />
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}