export function parseArgs() {
  const args = process.argv.slice(2);
  return {
    command: args[0] || "",
    target: args[1] || "",
  };
}
