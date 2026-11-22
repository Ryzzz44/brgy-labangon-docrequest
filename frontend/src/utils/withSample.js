// Stand-in helper: try the real backend call; if it fails (server off, endpoint not built yet),
// use the sample data instead so the page still works. Show a small "Sample data" note when isSample is true.
export async function withSample(promise, sample) {
  try {
    return { data: await promise, isSample: false };
  } catch (err) {
    console.warn('Using sample data:', err.message);
    return { data: sample, isSample: true };
  }
}
