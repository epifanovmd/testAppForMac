import { apiService } from "../../api";
import { IUserResponse } from "./Screen2.types";

export class Screen2Service {
  getUsers() {
    return apiService.get<IUserResponse>("users");
  }
}

export const screen2Service = new Screen2Service();
