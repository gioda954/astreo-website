import type { ContactStatus, DeliveryStatus, Order, PaymentStatus } from "@/lib/types";

type Status = ContactStatus | PaymentStatus | DeliveryStatus;

export function statusLabel(status: Status): string {
  return {
    da_contattare: "Da contattare",
    contattato: "Contattato",
    confermato: "Confermato",
    non_pagato: "Non pagato",
    parziale: "Parziale",
    pagato: "Pagato",
    da_programmare: "Da programmare",
    programmata: "Programmata",
    consegnata: "Consegnata",
  }[status];
}

export function statusTone(status: Status): "danger" | "warning" | "success" {
  if (["contattato", "confermato", "pagato", "consegnata"].includes(status)) return "success";
  if (["parziale", "programmata"].includes(status)) return "warning";
  return "danger";
}

export function campaignStats(orders: Order[]) {
  const active = orders.filter((order) => !order.cancelled_at);
  const sum = (key: "cases_quantity" | "bottles_quantity" | "expected_total_cents" | "collected_total_cents") => active.reduce((total, order) => total + order[key], 0);
  return {
    orders: active.length,
    cases: sum("cases_quantity"),
    bottles: sum("bottles_quantity"),
    expected: sum("expected_total_cents"),
    collected: sum("collected_total_cents"),
    remaining: sum("expected_total_cents") - sum("collected_total_cents"),
    toContact: active.filter((order) => order.contact_status === "da_contattare").length,
    toDeliver: active.filter((order) => order.delivery_status !== "consegnata").length,
  };
}
