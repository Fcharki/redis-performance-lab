import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Database } from "lucide-react";
import MetricCard from "./MetricCard";

describe("MetricCard", () => {
  it("renders the metric details", () => {
    render(
      <MetricCard
        title="SQLite response"
        value="12.50 ms"
        icon={<Database />}
        description="Direct database query"
      />
    );

    expect(screen.getByText("SQLite response")).toBeInTheDocument();
    expect(screen.getByText("12.50 ms")).toBeInTheDocument();
    expect(screen.getByText("Direct database query")).toBeInTheDocument();
  });
});
