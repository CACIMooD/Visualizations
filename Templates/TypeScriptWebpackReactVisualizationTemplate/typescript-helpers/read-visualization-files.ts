import { existsSync, readFile } from "fs";
import { globSync } from "glob";
import { join } from "path";

/**
 * Return a promise that resolves with the data inside files
 * @param filename - The filename to get in all visualizations
 * @param onFileRead - The callback to use when a file has been read
 */
export function readVisualizationFiles(
  filename: string,
  onFileRead: (path: string, data: Buffer) => void
): void {
  const globbedFiles = globSync(filename, {
    cwd: join(__dirname, "../src"),
    matchBase: true,
    absolute: true,
  });

  globbedFiles.forEach((filepath: string) => {
    console.log("Globbed", filepath);
    // Swap file out for .json.ejs versions if it exists as that is most up to date
    let actualPath = filepath.replace("no-guid.", "");
    if (!existsSync(actualPath)) {
      actualPath = filepath;
    }

    readFile(actualPath, (err: NodeJS.ErrnoException | null, data: Buffer) => {
      if (err) {
        console.error(`Unable to read file ${actualPath} due to an error`);
        throw err;
      }

      onFileRead(actualPath, data);
    });
  });
}
