import React, { FC, memo } from "react";
import { AppNavigation, AppTabScreens, StackProps } from "../navigation";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Screen1 } from "./screen1";
import { Screen2 } from "./screen2";

interface IProps extends StackProps {}

const TAB_SCREENS: AppTabScreens = {
  Page1: {
    screen: Screen1,
    options: {
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons
          name={"video-wireless"}
          color={color}
          size={size}
        />
      ),
    },
  },
  Page2: {
    screen: Screen2,
    options: {
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons
          name={"video-wireless"}
          color={color}
          size={size}
        />
      ),
    },
  },
};

export const TabScreens: FC<IProps> = memo(() => (
  <AppNavigation routes={TAB_SCREENS} initialRouteName={"MAIN"} />
));
