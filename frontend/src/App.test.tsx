import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the dashboard shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Redis Lab" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Performance Overview" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /run benchmark/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Fetch products to display them here.")
    ).toBeInTheDocument();
  });
});
