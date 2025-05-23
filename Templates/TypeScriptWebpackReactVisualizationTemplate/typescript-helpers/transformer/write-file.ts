import { existsSync, writeFile as fsWriteFile, mkdirSync } from "fs";
import { join } from "path";
import prettier from "prettier";

/**
 * Write a file to disk and format it with prettier
 * @param data - The data to write to the file
 * @param directory - The directory to write to
 * @param filename - The name to give the file
 * @returns - Returns void as we don't currently have a need to know if the write was successful
 * @throws - If the write failed
 */
export function writeFile(
  data: string,
  directory: string,
  filename: string
): void {
  //Ensure that the folder structure is set up correctly
  if (!existsSync(directory)) {
    mkdirSync(directory, {
      recursive: true,
    });
  }

  prettier
    .format(data, {
      parser: "typescript",
    })
    .then((result) => {
      fsWriteFile(
        join(directory, filename),
        result,
        (err: NodeJS.ErrnoException | null) => {
          if (err) {
            console.error(
              `Unable to write type to ${filename} at ${directory} due to an error`
            );

            throw err;
          }

          console.log(
            `Sucessfully wrote types to file ${filename} at ${directory}`
          );
        }
      );
    })
    .catch((err) => {
      // Prettier outputs far more than we need to if we let it throw itself, so we override it with this
      throw new Error(
        `Unable to format ${filename} at ${directory} with prettier due to an error` +
          err
      );
    });
}
