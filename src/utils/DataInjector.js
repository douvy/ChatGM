class DataInjector {
  constructor(data) {
    this.data = data;
  }

  inject(data) {
    this.data = { ...this.data, ...data };
  }

  get(key) {
    return this.data[key];
  }
}

const injector = new DataInjector({});
export default injector;
