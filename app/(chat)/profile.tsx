import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

const Profile = () => {

  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)");
  }

  return (
    <View style={{ flex: 1, alignItems: "center", padding: 16, gap: 16 }}>
      <Image
        source={{ uri: user?.imageUrl }}
        style={{ width: 100, height: 100, borderRadius: 50 }}
      />

      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>{user?.fullName}</Text>
        <Text>{user?.emailAddresses[0].emailAddress}</Text>
      </View>
      <Text>Profile</Text>
      <Button onPress={handleSignOut}>Sign Out</Button>
    </View>
  )
}

export default Profile