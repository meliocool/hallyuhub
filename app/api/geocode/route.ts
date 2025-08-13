import { NextResponse } from "next/server";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  const res = await fetch(
    `${NOMINATIM}?q=${encodeURIComponent(q)}&format=json&limit=1`,
    {
      headers: {
        "User-Agent":
          "HallyuHub/1.0 Personal Study Project (dhitanimam05@gmail.com)",
        "Accept-Language": "en",
      },
      next: { revalidate: 60 * 60 * 24 },
    }
  );

  if (!res.ok)
    return NextResponse.json(
      { error: "GeoCode Failed" },
      { status: res.status }
    );

  const data = await res.json();
  const top = data?.[0];
  if (!top) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  return NextResponse.json({
    lat: Number(top.lat),
    lng: Number(top.lon),
    displayName: top.display_name,
  });
}
