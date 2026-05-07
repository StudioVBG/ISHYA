import { getCurrentUserOrderByNumber } from "@/lib/queries/account";
import { formatDate, formatPrice } from "@/lib/utils";

function escape(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const order = await getCurrentUserOrderByNumber(orderNumber);
  if (!order) {
    return new Response("Facture introuvable", { status: 404 });
  }

  const addr = order.shippingAddress ?? {};
  const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(" ");
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td>
            <div class="item-name">${escape(item.productName)}</div>
            ${item.variantName ? `<div class="item-variant">${escape(item.variantName)}</div>` : ""}
            ${item.sku ? `<div class="item-sku">SKU&nbsp;: ${escape(item.sku)}</div>` : ""}
          </td>
          <td class="num">${item.quantity}</td>
          <td class="num">${escape(formatPrice(item.unitPrice))}</td>
          <td class="num">${escape(formatPrice(item.total))}</td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Facture ${escape(order.orderNumber)} — ISHYA</title>
<style>
  *,*::before,*::after{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#1a1a1a;background:#f5f5f5;margin:0;padding:24px}
  .page{max-width:780px;margin:0 auto;background:#fff;padding:48px;border:1px solid #e5e5e5;border-radius:8px}
  header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #1a1a1a}
  .brand{font-family:Georgia,serif;font-size:28px;font-weight:600;letter-spacing:.05em}
  .brand-sub{font-size:11px;color:#666;margin-top:4px;line-height:1.5}
  .invoice-meta{text-align:right}
  .invoice-meta h1{font-size:18px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.1em}
  .invoice-meta p{margin:2px 0;font-size:13px;color:#444}
  .meta-num{font-family:"SF Mono",Menlo,monospace;font-size:14px;color:#1a1a1a}
  .addresses{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px}
  .addr-block h2{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#888;margin:0 0 8px}
  .addr-block p{margin:1px 0;font-size:13px;line-height:1.5}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#666;padding:8px;border-bottom:1px solid #ddd;font-weight:600}
  th.num,td.num{text-align:right}
  td{padding:12px 8px;border-bottom:1px solid #f0f0f0;font-size:13px;vertical-align:top}
  .item-name{font-weight:500}
  .item-variant{font-size:12px;color:#666;margin-top:2px}
  .item-sku{font-size:11px;color:#999;margin-top:2px;font-family:"SF Mono",Menlo,monospace}
  .totals{margin-left:auto;width:280px}
  .totals .row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}
  .totals .grand{border-top:2px solid #1a1a1a;margin-top:6px;padding-top:10px;font-size:16px;font-weight:600}
  footer{margin-top:48px;padding-top:24px;border-top:1px solid #e5e5e5;font-size:11px;color:#888;line-height:1.6;text-align:center}
  .actions{max-width:780px;margin:0 auto 16px;display:flex;gap:8px;justify-content:flex-end}
  .actions button{padding:8px 16px;background:#1a1a1a;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:13px}
  @media print{
    body{background:#fff;padding:0}
    .actions{display:none}
    .page{border:0;padding:0;max-width:none}
  }
</style>
</head>
<body>
  <div class="actions">
    <button type="button" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
  </div>
  <div class="page">
    <header>
      <div>
        <div class="brand">ISHYA</div>
        <div class="brand-sub">
          ISHYA SAS · SIRET 912 345 678 00012<br/>
          RCS Paris B 912 345 678 · Capital social 10 000 €<br/>
          contact@ishya.fr
        </div>
      </div>
      <div class="invoice-meta">
        <h1>Facture</h1>
        <p class="meta-num">${escape(order.orderNumber)}</p>
        <p>Émise le ${escape(formatDate(order.createdAt))}</p>
      </div>
    </header>

    <div class="addresses">
      <div class="addr-block">
        <h2>Facturé à</h2>
        ${fullName ? `<p><strong>${escape(fullName)}</strong></p>` : ""}
        ${addr.line1 ? `<p>${escape(addr.line1)}</p>` : ""}
        ${addr.line2 ? `<p>${escape(addr.line2)}</p>` : ""}
        ${addr.postalCode || addr.city ? `<p>${escape([addr.postalCode, addr.city].filter(Boolean).join(" "))}</p>` : ""}
        ${addr.country ? `<p>${escape(addr.country)}</p>` : ""}
      </div>
      <div class="addr-block">
        <h2>Détails</h2>
        <p>Date de commande&nbsp;: ${escape(formatDate(order.createdAt))}</p>
        <p>Statut&nbsp;: ${escape(order.status)}</p>
        ${order.shipment?.trackingNumber ? `<p>Suivi&nbsp;: ${escape(order.shipment.trackingNumber)}</p>` : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Article</th>
          <th class="num">Qté</th>
          <th class="num">PU HT</th>
          <th class="num">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Sous-total</span><span>${escape(formatPrice(order.subtotal))}</span></div>
      <div class="row"><span>Livraison</span><span>${order.shippingTotal === 0 ? "Offerte" : escape(formatPrice(order.shippingTotal))}</span></div>
      ${order.discountTotal > 0 ? `<div class="row"><span>Réduction</span><span>−${escape(formatPrice(order.discountTotal))}</span></div>` : ""}
      <div class="row grand"><span>Total TTC</span><span>${escape(formatPrice(order.total))}</span></div>
    </div>

    <footer>
      Merci pour votre confiance.<br/>
      TVA non applicable, art. 293 B du CGI · ishya.fr
    </footer>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
