export class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}

export class LinkedList {
  constructor(optArray = []) {
    this.head = null;
    this.tail = null;
    this.indexMap = {};
    if (optArray) {
      this.fromArray(optArray);
    }
  }

  add(value) {
    const node = new Node(value);
    if (this.head === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    if (value.id) this.indexMap[value.id] = node;
  }

  remove(node) {
    if (node.prev !== null) {
      node.prev.next = node.next;
    }
    if (node.next !== null) {
      node.next.prev = node.prev;
    }
    if (this.head === node) {
      this.head = node.next;
    }
    if (this.tail === node) {
      this.tail = node.prev;
    }
  }

  fromArray(array) {
    array.forEach(value => this.add(value));
  }

  toArray() {
    const array = [];
    let current = this.head;
    while (current !== null) {
      array.push(current.value);
      current = current.next;
    }
    return array;
  }

  find(params) {
    return this.toArray().find(params);
  }

  mapArray(fn) {
    const array = this.toArray();
    return array.map(fn);
  }

  map(fn) {
    const mapped = this.mapArray(fn);
    return new LinkedList(mapped);
  }

  swap(node1, node2) {
    if (node1 === node2) {
      return;
    }

    let saveableValues = [];
    // console.log(
    //   node1.prev.value,
    //   node1.prev.value.prevTaskId,
    //   node1.value.prevTaskId,
    //   node2.value.prevTaskId,
    //   node2.next.value.prevTaskId
    // );
    const node1Prev = node1.prev;
    const node1Next = node1.next;
    const node2Prev = node2.prev;
    const node2Next = node2.next;

    // Swapping backwards
    if (node1Prev === node2) {
      node2.prev = node1;
      node2.value.prevTaskId = node1.value.id;
      saveableValues.push(node2.value);
      node1.next = node2;
      node1.prev = node2Prev;
      node1.value.prevTaskId = node2Prev?.value.id || null;
      saveableValues.push(node1.value);
      node2.next = node1Next;
      if (node2Prev !== null) {
        node2Prev.next = node1;
      }
      if (node1Next !== null) {
        node1Next.prev = node2;
        node1Next.value.prevTaskId = node2.value.id;
        saveableValues.push(node1Next.value);
      }

      // Swapping forwards
    } else if (node1Next === node2) {
      node1.prev = node2;
      node1.value.prevTaskId = node2.value.id;
      saveableValues.push(node1.value);
      node1.next = node2Next;
      node2.prev = node1Prev;
      node2.value.prevTaskId = node1Prev.value.id;
      saveableValues.push(node2.value);
      node2.next = node1;
      if (node1Prev !== null) {
        node1Prev.next = node2;
      }
      if (node2Next !== null) {
        node2Next.prev = node1;
        node2Next.value.prevTaskId = node1.value.id;
        saveableValues.push(node2Next.value);
      }
    } else {
      //   node1.prev = node2Prev;
      //   node1.next = node2Next;
      //   node2.prev = node1Prev;
      //   node2.next = node1Next;
    }
    if (this.head === node1) {
      this.head = node2;
    } else if (this.head === node2) {
      this.head = node1;
    }
    if (this.tail === node1) {
      this.tail = node2;
    } else if (this.tail === node2) {
      this.tail = node1;
    }

    return saveableValues;
  }

  toString() {
    return (
      this.toArray().reduce((acc, obj) => {
        // console.log(acc, obj.content);
        return acc + obj.content + ' -> ';
      }, '') + 'null'
    );
  }

  *[Symbol.iterator]() {
    let current = this.head;
    while (current !== null) {
      yield current;
      current = current.next;
    }
  }
}
