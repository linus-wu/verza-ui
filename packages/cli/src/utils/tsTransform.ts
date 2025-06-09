import ts from "typescript";

export function convertTsToJs(content: string, fileName: string): string {
  try {
    // Determine if JSX based on file extension
    const isJsx = fileName.endsWith(".tsx") || fileName.endsWith(".jsx");
    const isTypeScript = fileName.endsWith(".ts") || fileName.endsWith(".tsx");

    // Set compiler options
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      strict: false,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      removeComments: false,
      preserveConstEnums: false,
      declaration: false,
      sourceMap: false,
      inlineSourceMap: false,
      // JSX related settings
      jsx: isJsx ? ts.JsxEmit.Preserve : ts.JsxEmit.None,
      // Use react-jsx transform for React
      jsxImportSource: "react",
    };

    // Use TypeScript compiler API to transform code
    const result = ts.transpileModule(content, {
      compilerOptions,
      fileName: isTypeScript
        ? fileName
        : fileName.replace(/\.js(x?)$/, ".ts$1"),
    });

    let transformedCode = result.outputText;

    // Post-process: adjust indentation and clean up code
    transformedCode = postProcessTransformedCode(transformedCode, isJsx);

    return transformedCode;
  } catch (error) {
    console.warn(
      `Warning: Failed to transform ${fileName} using TypeScript API, falling back to content as-is`
    );
    // If transformation fails, return original content (removing obvious type annotations)
    return fallbackTransform(content);
  }
}

/**
 * Post-process transformed code to clean up potential issues
 */
function postProcessTransformedCode(code: string, isJsx: boolean): string {
  let processedCode = code;

  // First adjust indentation: change 4 spaces to 2 spaces
  processedCode = adjustIndentation(processedCode);

  // Remove possible remaining TypeScript imports
  processedCode = processedCode.replace(
    /import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?\s*\n?/g,
    ""
  );

  // Clean up export type statements
  processedCode = processedCode.replace(
    /export\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?\s*\n?/g,
    ""
  );

  // Remove isolated export type declarations
  processedCode = processedCode.replace(
    /export\s+type\s+\w+\s*=\s*[^;\n]+;\s*\n?/g,
    ""
  );

  // Clean up excessive blank lines
  processedCode = processedCode.replace(/\n\s*\n\s*\n/g, "\n\n");

  // If JSX file, ensure React import exists
  if (
    isJsx &&
    !processedCode.includes("import React") &&
    !processedCode.includes("import * as React")
  ) {
    // Check if JSX is used
    if (processedCode.includes("<") && processedCode.includes(">")) {
      processedCode = `import React from 'react';\n${processedCode}`;
    }
  }

  return processedCode;
}

/**
 * Adjust code indentation: change 4 spaces to 2 spaces
 */
function adjustIndentation(code: string): string {
  const lines = code.split("\n");

  return lines
    .map((line) => {
      // Calculate leading spaces count
      const leadingSpaces = line.match(/^(\s*)/)?.[1] || "";

      if (leadingSpaces.length === 0) {
        return line; // Return lines without indentation directly
      }

      // Replace consecutive 4 spaces with 2 spaces
      let adjustedSpaces = leadingSpaces;

      // Handle pure space indentation (replace every 4 spaces with 2 spaces)
      if (/^[ ]*$/.test(leadingSpaces)) {
        const spaceCount = leadingSpaces.length;
        const newSpaceCount = Math.floor(spaceCount / 4) * 2 + (spaceCount % 4);
        adjustedSpaces = " ".repeat(newSpaceCount);
      }

      return adjustedSpaces + line.substring(leadingSpaces.length);
    })
    .join("\n");
}

/**
 * Fallback transformation method for when TypeScript API fails
 */
function fallbackTransform(content: string): string {
  let transformedContent = content;

  // Only do basic type removal to avoid breaking code structure

  // Remove obvious type imports
  transformedContent = transformedContent.replace(
    /import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?\s*\n?/g,
    ""
  );

  // Remove simple type annotations (colon types after variables)
  transformedContent = transformedContent.replace(
    /:\s*(string|number|boolean|any|unknown|void|null|undefined)\b/g,
    ""
  );

  // Remove function return types (simple cases)
  transformedContent = transformedContent.replace(
    /\)\s*:\s*(string|number|boolean|any|unknown|void|JSX\.Element|React\.ReactNode)\s*=>/g,
    ") =>"
  );

  // Remove non-null assertions
  transformedContent = transformedContent.replace(/!/g, "");

  // Remove simple as type assertions
  transformedContent = transformedContent.replace(
    /\s+as\s+(string|number|boolean|any|unknown)\b/g,
    ""
  );

  // Adjust indentation
  transformedContent = adjustIndentation(transformedContent);

  return transformedContent;
}

/**
 * Check if code contains TypeScript-specific syntax
 */
export function hasTypeScriptSyntax(content: string): boolean {
  const tsPatterns = [
    /interface\s+\w+/,
    /type\s+\w+\s*=/,
    /:\s*(string|number|boolean|any|unknown|void)/,
    /import\s+type\s+/,
    /<[^<>]*>/, // Generics
    /\s+as\s+\w+/, // Type assertions
  ];

  return tsPatterns.some((pattern) => pattern.test(content));
}
