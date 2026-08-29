export function shortAddr(a) {
  return a ? a.slice(0, 6) + "…" + a.slice(-4) : "";
}

export async function fetchMetadata(uri) {
  try {
    if (uri.startsWith("data:application/json;base64,")) {
      const b64 = uri.replace("data:application/json;base64,", "");
      return JSON.parse(decodeURIComponent(escape(atob(b64))));
    }
    const res = await fetch(uri);
    return await res.json();
  } catch (e) {
    return { name: "Untitled", description: "", image: "" };
  }
}

export function buildDataURI(name, desc, image) {
  const json = JSON.stringify({ name, description: desc, image });
  return "data:application/json;base64," + btoa(unescape(encodeURIComponent(json)));
}
