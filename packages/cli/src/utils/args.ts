export function parseArgs() {
  const args = process.argv.slice(2);

  // Handle version flags
  if (args.includes("--version") || args.includes("-v")) {
    return { command: "--version", target: "" };
  }

  // Handle help flags
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    return { command: "--help", target: "" };
  }

  return {
    command: args[0] || "",
    target: args[1] || "",
    options: args.slice(2),
  };
}
