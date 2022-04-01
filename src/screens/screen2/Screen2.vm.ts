import { makeAutoObservable } from "mobx";
import { IUser } from "./Screen2.types";
import { screen2Service } from "./Screen2.service";
import { DataHolder } from "../../common";

class Screen2Vm {
  private holder: DataHolder<IUser[]> = new DataHolder([]);
  private search: string = "";

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get list() {
    return (this.holder.data || []).filter(
      item =>
        item.name.includes(this.search || "") ||
        item.email.includes(this.search || "") ||
        item.website.includes(this.search || "") ||
        item.username.includes(this.search || "") ||
        item.phone.includes(this.search || ""),
    );
  }

  get loading() {
    return this.holder.isLoading();
  }

  get loaded() {
    return this.holder.isReady();
  }

  onSearch(search: string) {
    this.search = search;
  }

  async onRefresh() {
    this.holder.setLoading();
    const res = await screen2Service.getUsers();

    if (res.error) {
      this.holder.setError({ msg: res.error.toString() });
    } else if (res.data) {
      this.holder.setData(res.data);
    }
  }
}

export const Screen2VM = new Screen2Vm();
