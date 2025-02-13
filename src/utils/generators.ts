export function generateRandomString(size: number): string {
  if (size <= 0) {
    throw new Error("Size must be a positive integer.");
  }

  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;

  const randomValues = new Uint8Array(size);
  crypto.getRandomValues(randomValues);

  let result = "";
  for (let i = 0; i < size; i++) {
    const index = randomValues[i] % charactersLength;
    result += characters[index];
  }

  return result;
}
