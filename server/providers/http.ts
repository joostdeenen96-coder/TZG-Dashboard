export async function fetchBytes(url: string): Promise<Uint8Array> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        accept: "application/json, text/javascript, text/plain, */*",
        "user-agent": "TeunesenDashboard/0.1 (planningsscherm)",
      },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new Error("Bron niet bereikbaar.");
  }
  if (!response.ok) {
    throw new Error(`Bron antwoordde met ${response.status}.`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

export async function fetchJson(url: string): Promise<unknown> {
  const bytes = await fetchBytes(url);
  const text = new TextDecoder("utf-8").decode(bytes);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Bron gaf geen geldige data.");
  }
}

export function decodeLatin1(bytes: Uint8Array) {
  return new TextDecoder("iso-8859-1").decode(bytes);
}
