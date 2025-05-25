import { buttonRegistry } from "./button/Button.registry";
import { inputRegistry } from "./input/Input.registry";
import { selectRegistry } from "./select/Select.registry";
import { Button } from "./button/Button";
import { Input } from "./input/Input";
import { Select } from "./select/Select";

export const componentsRegistry = {
  button: { component: Button, metadata: buttonRegistry },
  input: { component: Input, metadata: inputRegistry },
  select: { component: Select, metadata: selectRegistry },
};
