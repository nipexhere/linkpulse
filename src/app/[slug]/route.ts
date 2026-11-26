import { after, userAgent, type NextRequest } from "next/server";
import { getLinkBySlug, recordClick } from "@/lib/links";
import { referrerHost } from "@/lib/validate";

export async function GET(request: NextRequest, { params }: RouteContext<"/[slug]">) {
  const { slug } = await params;
  const link = await getLinkBySlug(slug);
  if (!link) {
    return Response.redirect(new URL(`/?missing=${encodeURIComponent(slug)}`, request.url), 307);
  }

  // Send the visitor on immediately; log the click once the response is out.
  const agent = userAgent(request);
  if (!agent.isBot) {
    after(() =>
      recordClick(link.id, {
        referrer: referrerHost(request.headers.get("referer")),
        country: request.headers.get("x-vercel-ip-country"),
        device: agent.device.type === "mobile" || agent.device.type === "tablet" ? agent.device.type : "desktop",
        browser: agent.browser.name ?? null,
      }),
    );
  }

  return Response.redirect(link.url, 307);
}
