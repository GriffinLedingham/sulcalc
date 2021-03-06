import { createLocalVue, shallowMount } from "@vue/test-utils";
import { Store, install as vuexInstall } from "vuex";
import AbilityComponent from "./Ability.vue";
import { Ability, Generation } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store;
beforeEach(() => {
  store = new Store({
    state: { gen: Generation.ORAS }
  });
});

test("supplies a list of ability values and labels to choose from", () => {
  const wrapper = shallowMount(AbilityComponent, {
    localVue,
    store,
    propsData: { ability: new Ability() }
  });
  for (const ability of wrapper.vm.abilities) {
    expect(ability).toEqual({
      value: expect.anything(),
      label: expect.any(String)
    });
  }
});

test("selects the ability if it's not selected, otherwise it selects nothing", () => {
  const wrapper = shallowMount(AbilityComponent, {
    localVue,
    store,
    propsData: { ability: new Ability() }
  });
  expect(wrapper.vm.valueObj).toBeNull();
  wrapper.setProps({ ability: new Ability({ name: "Levitate" }) });
  expect(wrapper.vm.valueObj).toEqual({
    value: "levitate",
    label: "Levitate"
  });
});

test("emits the new ability", () => {
  const wrapper = shallowMount(AbilityComponent, {
    localVue,
    store,
    propsData: { ability: new Ability() }
  });
  wrapper.vm.updateAbility(null);
  wrapper.vm.updateAbility({ value: "noability", label: "" });
  wrapper.vm.updateAbility({ value: "guts", label: "" });
  expect(wrapper.emitted().input).toHaveLength(3);
  const [ability1] = wrapper.emitted().input[0];
  expect(ability1).toBeInstanceOf(Ability);
  expect(ability1).toMatchObject({
    id: "noability",
    gen: Generation.ORAS
  });
  const [ability2] = wrapper.emitted().input[1];
  expect(ability2).toBeInstanceOf(Ability);
  expect(ability2).toMatchObject({
    id: "noability",
    gen: Generation.ORAS
  });
  const [ability3] = wrapper.emitted().input[2];
  expect(ability3).toBeInstanceOf(Ability);
  expect(ability3).toMatchObject({
    id: "guts",
    gen: Generation.ORAS
  });
});
