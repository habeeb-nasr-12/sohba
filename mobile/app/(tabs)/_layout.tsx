import React from "react";
import { Redirect } from "expo-router";
import { NativeTabs, Icon, Badge } from "expo-router/unstable-native-tabs";
import { useAuth } from "../../shared/contexts/AuthContext";
import { Platform ,DynamicColorIOS} from 'react-native';

const TabsLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) return <Redirect href="/(auth)" />;

  return (
    <NativeTabs 
     
      labelStyle={{
        fontSize: 10,
        fontWeight: '500',
        color: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
        // For the selected icon color
        tintColor: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
      }}
      {...(Platform.OS === 'ios' && {
        blurEffect: 'systemMaterial',
      })}
      
    >
      <NativeTabs.Trigger  options={{title :""}} name="index">
        <Icon 
          sf="house.fill" 
          drawable="ic_home_black_24dp" 
       
        />
        {/* <Label>Home</Label> */}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger options={{title :""}} name="search">
        <Icon 
          sf="magnifyingglass" 
          drawable="ic_search_black_24dp" 
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger options={{title :""}} name="notifications">
        <Icon 
          sf="bell.fill" 
          drawable="ic_notifications_black_24dp" 
        />
        {/* <Badge></Badge> */}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger options={{title :""}} name="messages">
        <Icon 
          sf="message.fill" 
          drawable="ic_message_black_24dp" 
        />
        <Badge>9+</Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger options={{title :""}} name="profile">
        <Icon 
          sf="person.fill" 
          drawable="ic_person_black_24dp" 
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
