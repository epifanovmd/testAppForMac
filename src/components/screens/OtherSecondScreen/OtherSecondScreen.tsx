import React, { FC, memo } from "react";
import { ScreenContainer } from "../../layouts";
import { Button, Text } from "../../ui";
import { StackProps } from "../../../navigation";

export const OtherSecondScreen: FC<StackProps> = memo(
  ({ navigation, route }) => (
    <ScreenContainer>
      <Text>{route.name}</Text>
      <Button
        title={"OtherFirstScreen"}
        onPress={() => navigation.navigate("OtherFirstScreen")}
      />
    </ScreenContainer>
  ),
);
