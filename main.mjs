import fs from 'node:fs/promises';
import Directory from './directory.mjs';

// default to commands.txt file when no override input file is passed in
let fileName = 'commands.txt';

// handle if user wants to override commands input file
if (process.argv.length === 3) {
  fileName = process.argv[2];
}

async function main() {
  try {
    // we would want to use streams for large files, but since these files are only holding
    // commands to be executed like a shell script, reading the entire file into memory should be okay
    const data = await fs.readFile(fileName, { encoding: 'utf8' });
    const dataSplitByLine = data.split(/\r?\n/);

    // ensure we check if command file has commands in it
    if (!dataSplitByLine.length) {
      console.log('no commands found in command file: ', fileName);
    }

    const directory = new Directory('root');
    for (const line of dataSplitByLine) {
      let error = false;
      const commands = line.split(' ');

      // ensure we have a good command
      if (!commands.length || !commands[0]) {
        console.log('error reading commands file in file: ', fileName);
        return;
      }

      const command = commands[0].toLocaleLowerCase();

      // ensure the command we receive is something we support
      if (
        command !== 'create' &&
        command !== 'list' &&
        command !== 'move' &&
        command !== 'delete'
      ) {
        console.log(
          `error unknown command input ${command} detected, ignoring`
        );
        error = true;
      }

      // if a command has more than 4 args, ignore
      if (commands.length >= 4) {
        console.log('error too many args passed with command, ignoring');
        error = true;
      }

      // if no errors detected with command, continue
      if (!error) {
        // output command that was inputted to satisfy output requirements
        console.log(line);

        // create command logic
        if (command === 'create') {
          const dirs = commands[1].split('/');
          // no child directories, just create the directory
          if (dirs.length === 1) {
            directory.create(commands[1]);
          } else {
            // there are child directories, lets fetch the directory we need
            const secondTolastChild = dirs[dirs.length - 2]; // get second to last child
            const lastChild = dirs[dirs.length - 1];
            const parent = directory.returnChild(
              secondTolastChild,
              directory.children
            );
            // we found the child directory
            if (parent) {
              parent.create(lastChild);
            } else {
              console.log(
                `cannot create directory with relationship: ${commands[1]} because ${secondTolastChild} was not found`
              );
              return;
            }
          }
        }

        // list command logic
        if (command === 'list') {
          // ensure we sort prior to listing
          directory.sortChildren(directory.children);
          // output the directories to satisfy output requirements
          directory.list(directory.children);
        }

        // move command logic
        if (command === 'move') {
          const dirs = commands[1].split('/');
          // no child directories, just move the directory
          if (dirs.length === 1) {
            const source = directory.returnChild(
              commands[1],
              directory.children
            );
            const destination = directory.returnChild(
              commands[2],
              directory.children
            );

            // this makes a copy of source to destination
            directory.move(source, destination);

            // this cleans up the existing path
            directory.delete(commands[1]);
          } else {
            // there are child directories, lets fetch the directory we need
            const secondTolastChild = dirs[dirs.length - 2]; // get second to last child
            const lastChild = dirs[dirs.length - 1];
            const source = directory.returnChild(lastChild, directory.children);
            const destination = directory.returnChild(
              commands[2],
              directory.children
            );
            const parent = directory.returnChild(
              secondTolastChild,
              directory.children
            );

            // this makes a copy of source to destination
            directory.move(source, destination);

            // this cleans up the existing path
            parent.delete(lastChild);
          }
        }

        // delete command logic
        if (command === 'delete') {
          let deleteError = false;
          const dirs = commands[1].split('/');
          // no child directories, just delete the directory
          if (dirs.length === 1) {
            directory.delete(commands[1]);
          } else {
            // ensure paths exist
            const firstPath = dirs[0];
            let found = false;
            // todo: note this is only checking the first path inside the root directory
            // would need to be rewritten to iterate through all parent -> child levels
            for (const rootChild of directory.children) {
              if (rootChild.getName() === firstPath) {
                found = true;
              }
            }

            // parent -> child relationship was not found, output error message to satisfy requirements
            if (!found) {
              console.log(
                `Cannot delete ${dirs.join('/')} - ${firstPath} does not exist`
              );
              deleteError = true;
            }

            if (!deleteError) {
              // there are child directories, lets fetch the directory we need
              const secondTolastChild = dirs[dirs.length - 2]; // get second to last child
              const lastChild = dirs[dirs.length - 1];
              const parent = directory.returnChild(
                secondTolastChild,
                directory.children
              );
              parent.delete(lastChild);
            }
          }
        }
      }
    }

    //console.log(data);
  } catch (err) {
    console.log(err);
  }
}

main();
