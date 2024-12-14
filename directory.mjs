class Directory {
  constructor(name, children = []) {
    this.name = name;
    this.children = children;
  }

  // creates a new directory
  create(name, children = []) {
    this.children.push(new Directory(name, children));
  }

  // deletes a child directory by name
  delete(name) {
    this.children = this.children.filter((dir) => {
      return dir.name !== name;
    });
  }

  // ouputs a directories name
  getName(name) {
    return this.name;
  }

  // recursively outputs directories
  list(children, loopNum = 0) {
    if (children.length) {
      for (const child of children) {
        let spaces = '  '.repeat(loopNum);
        // ensure we dont indent on the first output
        if (loopNum === 0) {
          spaces = '';
        }
        console.log(`${spaces}${child.getName()}`);
        if (child.children.length) {
          this.list(child.children, loopNum + 1);
        }
      }
    }
  }

  // recursively finds a directory by name
  returnChild(name, children) {
    if (children.length) {
      for (const child of children) {
        // if its a match return the child
        if (child.getName() === name) {
          return child;
        }
        // recurse into children
        if (child.children.length) {
          const foundChild = this.returnChild(name, child.children);
          if (foundChild && foundChild.getName() === name) {
            return foundChild;
          }
        }
      }
      return false;
    }
  }

  // copies a source directory to a destination
  move(source, destination) {
    const children = source.children;
    destination.create(source.getName(), children);
  }

  // sorts by name property of children array
  sortChildren(children) {
    children.sort((a, b) => {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    for (const child of children) {
      if (child.children.length) {
        this.sortChildren(child.children);
      }
    }
  }
}

export default Directory;
