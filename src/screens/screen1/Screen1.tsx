import React, { FC, memo } from "react";
import { Button, ScreenContainer, Text } from "../../components";
import { AppScreenProps } from "../../navigation";
import { useTheme } from "../../common";
import { useNotification } from "../../components/notification/useNotification";

interface IProps extends AppScreenProps {}

let id: string;

export const Screen1: FC<IProps> = memo(({ navigation, route }) => {
  const { showMessage, hideMessage } = useNotification();
  const { theme } = useTheme();

  return (
    <ScreenContainer>
      <Text>{route.name}</Text>
      <Button
        title={"OtherFirstScreen"}
        onPress={() => navigation.navigate("OtherFirstScreen")}
      />
      <Button
        title={"Show notify top"}
        onPress={() =>
          showMessage(
            {
              title: "title",
              description: "description",
            },
            { hideOnPress: true },
          )
        }
      />
      <Button
        title={"Show notify center"}
        onPress={() =>
          showMessage("Simple message center", {
            position: "center",
          })
        }
      />

      <Button
        title={"Show notify bottom"}
        onPress={() => {
          id = showMessage("Simple message bottom", {
            position: "bottom",
            floating: false,
          });
        }}
      />
      <Button title={"hideMessage"} onPress={() => hideMessage()} />
    </ScreenContainer>
  );
});
