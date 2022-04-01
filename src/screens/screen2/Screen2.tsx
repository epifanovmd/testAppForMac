import React, { FC, useCallback, useEffect, useMemo } from "react";
import {
  Col,
  DelayRefreshControl,
  Input,
  Row,
  ScreenContainer,
  Text,
} from "../../components";
import { FlatList, ListRenderItemInfo } from "react-native";
import { IUser } from "./Screen2.types";
import { AppScreenProps } from "../../navigation";
import { observer } from "mobx-react-lite";
import { Screen2VM } from "./Screen2.vm";

export const Screen2: FC<AppScreenProps> = observer(() => {
  const { loading, list, onRefresh, onSearch } = Screen2VM;

  useEffect(() => {
    onRefresh().then();
  }, [onRefresh]);

  const keyExtractor = useCallback((item: IUser) => item.id.toString(), []);
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<IUser>) => (
      <Col mv={8} bg={"gray"} radius={10} pa={6}>
        <Text fontWeight={"bold"}>{item.name}</Text>
        <Text>{item.email}</Text>
        <Text>{item.phone}</Text>
        <Text>{item.website}</Text>
      </Col>
    ),
    [],
  );

  const listHeaderComponent = useMemo(
    () => (
      <Row>
        <Text>{"Header"}</Text>
      </Row>
    ),
    [],
  );
  const listEmptyComponent = useMemo(
    () => (
      <Row>
        <Text>{"Empty"}</Text>
      </Row>
    ),
    [],
  );
  const listFooterComponent = useMemo(
    () => (
      <Row>
        <Text>{"Footer"}</Text>
      </Row>
    ),
    [],
  );

  const refreshControl = (
    <DelayRefreshControl refreshing={loading} onRefresh={onRefresh} />
  );

  return (
    <ScreenContainer>
      <Row pa={16}>
        <Input placeholder={"placeholder"} mb={10} onChangeText={onSearch} />
      </Row>
      <Text>{`Loading - ${loading}`}</Text>
      <FlatList
        data={list}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={listFooterComponent}
        renderItem={renderItem}
        refreshControl={refreshControl}
      />
    </ScreenContainer>
  );
});
