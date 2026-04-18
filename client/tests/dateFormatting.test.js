import { describe, expect, it } from "vitest";

import { formatDate, formatDateRange } from "../src/lib/dateFormatting";

describe("dateFormatting", () => {
  it("formats YYYY-MM with month-year style", () => {
    expect(formatDate("2024-02", "en-US", "month-year")).toBe("Feb 2024");
  });

  it("returns fallback input when date is invalid", () => {
    expect(formatDate("not-a-date", "en-US", "month-year")).toBe("not-a-date");
  });

  it("uses Present label when current is true", () => {
    expect(formatDateRange("2023-01", undefined, "en-US", { current: true })).toBe("Jan 2023 \u2014 Present");
  });
});
