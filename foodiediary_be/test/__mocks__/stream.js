class MockReadable {
  constructor() {
    this.data = null;
  }

  push(data) {
    this.data = data;
    return this;
  }

  pipe(dest) {
    if (typeof dest.processData === 'function') {
      dest.processData(this.data);
    }
    return dest;
  }
}

module.exports = {
  Readable: MockReadable
};