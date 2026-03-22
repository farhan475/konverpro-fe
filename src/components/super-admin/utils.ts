export function toSafeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;

    const cleaned = trimmed.replace(/[^\d.,-]/g, "");
    if (!cleaned) return fallback;

    let normalized = cleaned;
    const commaCount = (cleaned.match(/,/g) ?? []).length;
    const dotCount = (cleaned.match(/\./g) ?? []).length;

    if (commaCount > 0 && dotCount > 0) {
      if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
        normalized = cleaned.replace(/\./g, "").replace(",", ".");
      } else {
        normalized = cleaned.replace(/,/g, "");
      }
    } else if (dotCount > 1) {
      normalized = cleaned.replace(/\./g, "");
    } else if (commaCount > 1) {
      normalized = cleaned.replace(/,/g, "");
    } else if (commaCount === 1 && dotCount === 0) {
      const [whole = "0", fraction = ""] = cleaned.split(",");
      normalized =
        fraction.length === 3 ? `${whole}${fraction}` : `${whole}.${fraction}`;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

export function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(toSafeNumber(value));
}

export function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getErrorMessage(error: unknown, fallback = "Terjadi kesalahan.") {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as {
      response?: { data?: { message?: string } };
    }).response;

    if (response?.data?.message) return response.data.message;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
