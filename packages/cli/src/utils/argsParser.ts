export function parseArgs() {
  const args = process.argv.slice(2);

  // Handle version flags
  if (args.includes("--version") || args.includes("-v")) {
    return { command: "--version", target: "", options: [], flags: {} };
  }

  // Handle help flags
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    return { command: "--help", target: "", options: [], flags: {} };
  }

  // Parse flags
  const flags: Record<string, boolean> = {};
  const nonFlagArgs: string[] = [];

  args.forEach((arg) => {
    if (arg.startsWith("--")) {
      const flagName = arg.slice(2);
      flags[flagName] = true;
    } else if (arg.startsWith("-") && arg.length > 1) {
      // Handle short flags
      const shortFlags = arg.slice(1);
      for (const flag of shortFlags) {
        switch (flag) {
          case "f":
            flags.force = true;
            break;
          case "l":
            flags.list = true;
            break;
        }
      }
    } else {
      nonFlagArgs.push(arg);
    }
  });

  return {
    command: nonFlagArgs[0] || "",
    target: nonFlagArgs[1] || "",
    options: nonFlagArgs.slice(2),
    flags,
  };
}
