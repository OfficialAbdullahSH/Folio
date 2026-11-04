import type {
  AuthPorts,
  SignInInput,
  SignInOutcome,
  SignUpInput,
  SignUpOutcome,
} from "../ports";

type FakeOptions = {
  takenUsernames?: readonly string[];
  signUp?: (input: SignUpInput, taken: Set<string>) => SignUpOutcome;
  signIn?: (input: SignInInput) => SignInOutcome;
  profileExists?: (userId: string) => boolean;
};

export type FakePorts = {
  ports: AuthPorts;
  calls: {
    signUp: SignUpInput[];
    signIn: SignInInput[];
    signOut: number;
    usernameTaken: string[];
    profileExists: string[];
  };
  taken: Set<string>;
};

const okSignUp = (input: SignUpInput): SignUpOutcome => ({
  user: { id: "user-1", email: input.email },
  hasSession: true,
  error: null,
});

const okSignIn = (input: SignInInput): SignInOutcome => ({
  user: { id: "user-1", email: input.email },
  error: null,
});

export function fakePorts(options: FakeOptions = {}): FakePorts {
  const calls: FakePorts["calls"] = {
    signUp: [],
    signIn: [],
    signOut: 0,
    usernameTaken: [],
    profileExists: [],
  };
  const taken = new Set(options.takenUsernames ?? []);

  const ports: AuthPorts = {
    async signUp(input) {
      calls.signUp.push(input);
      return options.signUp ? options.signUp(input, taken) : okSignUp(input);
    },
    async signIn(input) {
      calls.signIn.push(input);
      return options.signIn ? options.signIn(input) : okSignIn(input);
    },
    async signOut() {
      calls.signOut += 1;
    },
    async usernameTaken(username) {
      calls.usernameTaken.push(username);
      return taken.has(username);
    },
    async profileExists(userId) {
      calls.profileExists.push(userId);
      return options.profileExists ? options.profileExists(userId) : true;
    },
  };

  return { ports, calls, taken };
}
