import { createLocalVue, shallowMount } from "@vue/test-utils";
import { Store, install as vuexInstall } from "vuex";
import ItemComponent from "./Item.vue";
import { Generation, Item } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store;
beforeEach(() => {
  store = new Store({
    state: { gen: Generation.ORAS }
  });
});

test("supplies a list of item values and labels to choose from", () => {
  const wrapper = shallowMount(ItemComponent, {
    localVue,
    store,
    propsData: { item: new Item() }
  });
  for (const item of wrapper.vm.items) {
    expect(item).toEqual({
      value: expect.anything(),
      label: expect.any(String)
    });
  }
});

test("selects the item if it's not selected, otherwise it selects nothing", () => {
  const wrapper = shallowMount(ItemComponent, {
    localVue,
    store,
    propsData: { item: new Item() }
  });
  expect(wrapper.vm.valueObj).toBeNull();
  wrapper.setProps({ item: new Item({ name: "Leftovers" }) });
  expect(wrapper.vm.valueObj).toEqual({
    value: "leftovers",
    label: "Leftovers"
  });
});

test("emits the new item", () => {
  const wrapper = shallowMount(ItemComponent, {
    localVue,
    store,
    propsData: { item: new Item() }
  });
  wrapper.vm.updateItem(null);
  wrapper.vm.updateItem({ value: "noitem", label: "" });
  wrapper.vm.updateItem({ value: "choicescarf", label: "" });
  expect(wrapper.emitted().input).toHaveLength(3);
  const [item1] = wrapper.emitted().input[0];
  expect(item1).toBeInstanceOf(Item);
  expect(item1).toMatchObject({
    id: "noitem",
    gen: Generation.ORAS
  });
  const [item2] = wrapper.emitted().input[1];
  expect(item2).toBeInstanceOf(Item);
  expect(item2).toMatchObject({
    id: "noitem",
    gen: Generation.ORAS
  });
  const [item3] = wrapper.emitted().input[2];
  expect(item3).toBeInstanceOf(Item);
  expect(item3).toMatchObject({
    id: "choicescarf",
    gen: Generation.ORAS
  });
});
