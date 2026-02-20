import { hash, genSalt, compare } from "bcrypt";

export const hashPassword = async (password: string) => {
  const salt = await genSalt(10);
  return hash(password, salt);
};

export const comparePassword = (password: string, correctPassword: string) => {
  return compare(password, correctPassword);
};
