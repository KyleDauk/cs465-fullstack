// Wraps whatever the authentication process hands back. Today that is a JWT;
// keeping it behind its own class means swapping the scheme later does not
// ripple through every caller.
export class AuthResponse {
  token: string;

  constructor() {
    this.token = '';
  }
}
