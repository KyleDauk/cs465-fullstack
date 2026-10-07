// How a user is represented in the front end. Narrower than the Express
// model on purpose: the browser has no business holding the hash or salt.
export class User {
  email: string;
  name: string;

  constructor() {
    this.email = '';
    this.name = '';
  }
}
