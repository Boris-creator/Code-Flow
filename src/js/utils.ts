export async function delay(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

export function multiply(vector: number[], matrix: number[][]) {
  return vector.map((e, i) =>
    vector.reduce((sum, n, j) => sum + n * matrix[j][i], 0)
  );
}
