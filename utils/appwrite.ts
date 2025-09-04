import { Client, TablesDB } from "react-native-appwrite";


if (!process.env.EXPO_APPWRITE_PROJECT_ID) {
  throw new Error("EXPO_PUBLIC_APPWRITE_PROJECT_ID is not set");
}

/**
 * Create a db in appwrite and add your collections
 */
const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: process.env.EXPO_APPWRITE_PROJECT_ID!,
  platform: "com.abboss.modernchatapp",
  db: "68b55c570033a129ee3b",
  col: {
    chatRooms: "chatrooms",
    messages: "messages",
    users: "users"
  },
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const tablesDB = new TablesDB(client);
export { appwriteConfig, client, tablesDB };

